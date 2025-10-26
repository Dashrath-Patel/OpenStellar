const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const BountyIssue = require('../models/bountyIssue');

/**
 * Verify GitHub webhook signature
 * GitHub signs webhook payloads with a secret
 */
function verifyGitHubSignature(req, secret) {
    if (!secret) {
        console.warn('⚠️ GitHub webhook secret not configured');
        return true; // Allow in development if no secret
    }

    const signature = req.headers['x-hub-signature-256'];
    if (!signature) {
        return false;
    }

    const payload = JSON.stringify(req.body);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');

    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * POST /api/webhooks/github
 * Handle GitHub webhook events
 */
router.post('/github', express.json({ verify: (req, res, buf) => { req.rawBody = buf } }), async (req, res) => {
    try {
        // Verify signature
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        if (!verifyGitHubSignature(req, secret)) {
            console.error('❌ Invalid GitHub webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const event = req.headers['x-github-event'];
        const payload = req.body;

        console.log(`📨 Received GitHub webhook: ${event}`);

        // Handle different events
        switch (event) {
            case 'pull_request':
                await handlePullRequest(payload);
                break;
            
            case 'pull_request_review':
                await handlePullRequestReview(payload);
                break;
            
            case 'issue_comment':
                await handleIssueComment(payload);
                break;
            
            default:
                console.log(`ℹ️ Unhandled webhook event: ${event}`);
        }

        // Always respond 200 to acknowledge receipt
        res.status(200).json({ received: true });

    } catch (error) {
        console.error('Error handling GitHub webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Handle pull_request events
 * Triggers on: opened, closed, reopened, edited, etc.
 */
async function handlePullRequest(payload) {
    const action = payload.action; // opened, closed, reopened, etc.
    const pr = payload.pull_request;
    const repo = payload.repository.full_name;

    console.log(`🔔 PR ${action}: ${repo}#${pr.number}`);

    // When PR is opened
    if (action === 'opened') {
        // Check if PR references any bounty issue
        const issueNumber = extractIssueNumber(pr.body || '');
        
        if (issueNumber) {
            // Find bounty with this issue number and repo
            const bounty = await BountyIssue.findOne({
                repoFullName: repo,
                githubIssueNumber: issueNumber,
                status: 'in_progress'
            });

            if (bounty) {
                console.log(`✅ Found bounty for issue #${issueNumber}`);
                
                // Update bounty with PR info
                bounty.prNumber = pr.number;
                bounty.prUrl = pr.html_url;
                bounty.prSubmittedAt = new Date(pr.created_at);
                bounty.status = 'under_review';
                
                await bounty.save();

                console.log(`✅ Auto-marked bounty as under_review: ${bounty._id}`);
                
                // TODO: Send notification to creator
                // await sendNotification(bounty.creatorId, 'work_submitted', bounty);
            }
        }
    }

    // When PR is merged
    if (action === 'closed' && pr.merged) {
        // Find bounty with this PR
        const bounty = await BountyIssue.findOne({
            repoFullName: repo,
            prNumber: pr.number,
            status: 'under_review'
        });

        if (bounty) {
            console.log(`🎉 PR merged for bounty: ${bounty._id}`);
            
            bounty.prMergedAt = new Date(pr.merged_at);
            
            // Auto-complete bounty when PR is merged
            // Note: Creator still needs to explicitly approve payment
            // Or you can auto-release here if policy allows
            
            await bounty.save();
            
            console.log(`✅ Bounty PR merged: ${bounty._id}`);
            
            // TODO: Notify creator to release payment
            // await sendNotification(bounty.creatorId, 'pr_merged', bounty);
        }
    }
}

/**
 * Handle pull_request_review events
 * Triggers when creator reviews the PR
 */
async function handlePullRequestReview(payload) {
    const action = payload.action; // submitted, edited, dismissed
    const review = payload.review;
    const pr = payload.pull_request;
    const repo = payload.repository.full_name;

    console.log(`📝 PR Review ${action}: ${repo}#${pr.number} - ${review.state}`);

    // Find bounty with this PR
    const bounty = await BountyIssue.findOne({
        repoFullName: repo,
        prNumber: pr.number
    }).populate('creatorId');

    if (!bounty) return;

    // Check if reviewer is the bounty creator
    const reviewerLogin = review.user.login;
    const creatorGithub = bounty.creatorId.github;

    if (reviewerLogin === creatorGithub) {
        console.log(`✅ Creator reviewed PR for bounty: ${bounty._id}`);
        
        // Add review feedback to notes
        if (review.body) {
            bounty.notes = (bounty.notes || '') + `\n\nCreator Review: ${review.body}`;
            await bounty.save();
        }

        // If approved, you could auto-trigger payment
        if (review.state === 'approved' && bounty.status === 'under_review') {
            console.log(`🎉 Creator approved PR! Consider auto-releasing payment.`);
            // TODO: Auto-release payment or notify creator
        }

        // If changes requested
        if (review.state === 'changes_requested') {
            bounty.status = 'in_progress';
            await bounty.save();
            console.log(`🔄 Changes requested for bounty: ${bounty._id}`);
        }
    }
}

/**
 * Handle issue_comment events
 * Useful for commands like /apply, /submit-work, etc.
 */
async function handleIssueComment(payload) {
    const action = payload.action; // created, edited, deleted
    const comment = payload.comment;
    const issue = payload.issue;
    const repo = payload.repository.full_name;

    if (action !== 'created') return;

    console.log(`💬 Comment on ${repo}#${issue.number}: ${comment.body.substring(0, 50)}...`);

    // Check if comment is on a bounty issue
    const bounty = await BountyIssue.findOne({
        repoFullName: repo,
        githubIssueNumber: issue.number
    });

    if (bounty) {
        console.log(`📌 Comment on bounty issue: ${bounty._id}`);
        
        // You could implement slash commands here
        // Example: /apply, /cancel, /submit-pr <url>
        
        // For now, just log it
        // Future: Parse commands and trigger actions
    }
}

/**
 * Extract issue number from PR body
 * Looks for patterns like: Fixes #123, Closes #123, Resolves #123
 */
function extractIssueNumber(text) {
    const patterns = [
        /(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(\d+)/gi,
        /#(\d+)/g
    ];

    for (const pattern of patterns) {
        const match = pattern.exec(text);
        if (match) {
            return parseInt(match[1]);
        }
    }

    return null;
}

/**
 * GET /api/webhooks/test
 * Test endpoint to verify webhook setup
 */
router.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
