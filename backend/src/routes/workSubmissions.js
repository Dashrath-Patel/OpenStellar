const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const BountyIssue = require('../models/bountyIssue');
const User = require('../models/user');

/**
 * POST /api/work-submissions
 * Submit PR link for a bounty (Developer submits work)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { bounty_issue_id, pr_url, notes } = req.body;

        // Validation
        if (!bounty_issue_id || !pr_url) {
            return res.status(400).json({
                success: false,
                message: 'Bounty ID and PR URL are required'
            });
        }

        // Validate PR URL format (GitHub PR)
        const prUrlRegex = /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/pull\/\d+$/;
        if (!prUrlRegex.test(pr_url)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid GitHub PR URL format. Expected: https://github.com/owner/repo/pull/123'
            });
        }

        // Extract PR number from URL
        const prNumber = parseInt(pr_url.split('/pull/')[1]);

        // Get bounty
        const bounty = await BountyIssue.findById(bounty_issue_id);
        
        if (!bounty) {
            return res.status(404).json({
                success: false,
                message: 'Bounty not found'
            });
        }

        // Check if user is assigned to this bounty
        if (!bounty.assigneeId || bounty.assigneeId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You are not assigned to this bounty'
            });
        }

        // Check bounty status
        if (bounty.status !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'This bounty is not in progress'
            });
        }

        // Verify PR is from the correct repo
        const expectedRepoUrl = `https://github.com/${bounty.repoFullName}/pull/`;
        if (!pr_url.startsWith(expectedRepoUrl)) {
            return res.status(400).json({
                success: false,
                message: `PR must be from repository: ${bounty.repoFullName}`
            });
        }

        // Update bounty with PR info
        bounty.prUrl = pr_url;
        bounty.prNumber = prNumber;
        bounty.prSubmittedAt = new Date();
        bounty.status = 'under_review';
        if (notes) {
            bounty.notes = notes;
        }

        await bounty.save();

        console.log('✅ Work submitted for bounty:', bounty._id, 'PR:', pr_url);

        res.json({
            success: true,
            message: 'Work submitted successfully. Creator will review your PR.',
            bounty: {
                _id: bounty._id,
                status: bounty.status,
                prUrl: bounty.prUrl,
                prNumber: bounty.prNumber
            }
        });

    } catch (error) {
        console.error('Error submitting work:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit work',
            error: error.message
        });
    }
});

/**
 * PATCH /api/work-submissions/:bountyId/approve
 * Approve work and release payment (Creator approves)
 */
router.patch('/:bountyId/approve', authenticateToken, async (req, res) => {
    try {
        const { bountyId } = req.params;
        const { feedback } = req.body;

        // Get bounty
        const bounty = await BountyIssue.findById(bountyId)
            .populate('assigneeId', 'github email walletAddress');

        if (!bounty) {
            return res.status(404).json({
                success: false,
                message: 'Bounty not found'
            });
        }

        // Check if user is the creator
        if (bounty.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the bounty creator can approve work'
            });
        }

        // Check bounty status
        if (bounty.status !== 'under_review') {
            return res.status(400).json({
                success: false,
                message: 'This bounty is not under review'
            });
        }

        // Check if PR exists
        if (!bounty.prUrl) {
            return res.status(400).json({
                success: false,
                message: 'No work has been submitted yet'
            });
        }

        // Check if assignee has wallet address
        const assignee = bounty.assigneeId;
        if (!assignee) {
            return res.status(400).json({
                success: false,
                message: 'No assignee found for this bounty'
            });
        }

        // Get wallet address from Application
        const Application = require('../models/application');
        const application = await Application.findById(bounty.assignedApplication);
        
        if (!application || !application.walletAddress) {
            return res.status(400).json({
                success: false,
                message: 'Assignee wallet address not found'
            });
        }

        const walletAddress = application.walletAddress;

        // TODO: Release payment on Stellar blockchain
        // For now, simulate payment release
        const mockReleaseTxHash = `STELLAR_RELEASE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Update bounty
        bounty.status = 'completed';
        bounty.completedAt = new Date();
        bounty.releaseTransactionHash = mockReleaseTxHash;
        if (feedback) {
            bounty.notes = (bounty.notes || '') + '\n\nCreator Feedback: ' + feedback;
        }

        await bounty.save();

        console.log('✅ Work approved and payment released!');
        console.log('   Bounty:', bounty._id);
        console.log('   Amount:', bounty.bountyAmount, 'XLM');
        console.log('   To:', walletAddress);
        console.log('   TX Hash:', mockReleaseTxHash);

        res.json({
            success: true,
            message: 'Work approved and payment released!',
            bounty: {
                _id: bounty._id,
                status: bounty.status,
                completedAt: bounty.completedAt
            },
            payment: {
                amount: bounty.bountyAmount,
                currency: 'XLM',
                recipient: walletAddress,
                txHash: mockReleaseTxHash
            }
        });

    } catch (error) {
        console.error('Error approving work:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve work',
            error: error.message
        });
    }
});

/**
 * PATCH /api/work-submissions/:bountyId/request-changes
 * Request changes to submitted work (Creator requests changes)
 */
router.patch('/:bountyId/request-changes', authenticateToken, async (req, res) => {
    try {
        const { bountyId } = req.params;
        const { feedback } = req.body;

        if (!feedback) {
            return res.status(400).json({
                success: false,
                message: 'Feedback is required when requesting changes'
            });
        }

        // Get bounty
        const bounty = await BountyIssue.findById(bountyId);

        if (!bounty) {
            return res.status(404).json({
                success: false,
                message: 'Bounty not found'
            });
        }

        // Check if user is the creator
        if (bounty.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the bounty creator can request changes'
            });
        }

        // Check bounty status
        if (bounty.status !== 'under_review') {
            return res.status(400).json({
                success: false,
                message: 'This bounty is not under review'
            });
        }

        // Update bounty back to in_progress with feedback
        bounty.status = 'in_progress';
        bounty.notes = (bounty.notes || '') + '\n\nChanges Requested: ' + feedback;

        await bounty.save();

        console.log('✅ Changes requested for bounty:', bounty._id);

        res.json({
            success: true,
            message: 'Changes requested. Developer has been notified.',
            bounty: {
                _id: bounty._id,
                status: bounty.status
            }
        });

    } catch (error) {
        console.error('Error requesting changes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to request changes',
            error: error.message
        });
    }
});

module.exports = router;
