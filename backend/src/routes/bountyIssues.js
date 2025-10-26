const express = require('express');
const router = express.Router();
const { 
    createGitHubIssue, 
    hasRepoAccess, 
    formatBountyIssueBody,
    formatBountyBotComment,
    addGitHubComment
} = require('../github');
const { authenticateToken } = require('./auth');
const User = require('../models/user');
const BountyIssue = require('../models/bountyIssue');

/**
 * POST /api/bounty-issues
 * Create a new bounty issue (GitHub + Stellar)
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            repo_full_name,
            title,
            description,
            difficulty,
            skills,
            bounty_amount,
            deadline
        } = req.body;

        // Validation
        if (!repo_full_name || !title || !description || !difficulty || !bounty_amount) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid difficulty level'
            });
        }

        if (bounty_amount < 1) {
            return res.status(400).json({
                success: false,
                message: 'Bounty amount must be at least 1 XLM'
            });
        }

        if (!Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one skill is required'
            });
        }

        // Get user
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.githubAccessToken) {
            return res.status(401).json({
                success: false,
                message: 'GitHub account not connected'
            });
        }

        // Parse repo owner and name
        const [owner, repo] = repo_full_name.split('/');
        
        if (!owner || !repo) {
            return res.status(400).json({
                success: false,
                message: 'Invalid repository format. Expected: owner/repo'
            });
        }

        // Check write access
        const hasAccess = await hasRepoAccess(user.githubAccessToken, owner, repo);
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'You do not have write access to this repository'
            });
        }

        // TODO: Check user's Stellar balance
        // For now, we'll skip this check

        // Step 1: Create database entry (status: pending_github)
        const bountyIssue = new BountyIssue({
            repoFullName: repo_full_name,
            title,
            description,
            difficulty,
            skills,
            bountyAmount: bounty_amount,
            deadline: deadline ? new Date(deadline) : null,
            creatorId: user._id,
            status: 'pending_github'
        });

        await bountyIssue.save();
        console.log('✅ Bounty issue saved to database:', bountyIssue._id);

        // Step 2: Create GitHub Issue
        try {
            const issueBody = formatBountyIssueBody({
                description,
                payAmount: bounty_amount,
                difficulty,
                skills,
                endDate: deadline,
                gitRepo: repo_full_name,
                bountyId: bountyIssue._id
            });

            const githubIssue = await createGitHubIssue(
                user.githubAccessToken,
                owner,
                repo,
                {
                    title,
                    body: issueBody,
                    labels: ['bounty', `bounty-${difficulty}`, ...skills.map(s => `skill-${s.toLowerCase()}`)]
                }
            );

            console.log('✅ GitHub issue created:', githubIssue.number);

            // Update with GitHub info
            bountyIssue.githubIssueNumber = githubIssue.number;
            bountyIssue.githubIssueUrl = githubIssue.html_url;
            bountyIssue.status = 'pending_blockchain';
            await bountyIssue.save();

            // Step 2.5: Add bot comment to guide developers
            try {
                const botComment = formatBountyBotComment({
                    bountyId: bountyIssue._id,
                    payAmount: bounty_amount,
                    difficulty,
                    skills,
                    endDate: deadline
                });

                await addGitHubComment(
                    user.githubAccessToken,
                    owner,
                    repo,
                    githubIssue.number,
                    botComment
                );

                console.log('✅ Bot comment added to GitHub issue');
            } catch (commentError) {
                // Don't fail the whole process if comment fails
                console.warn('⚠️ Failed to add bot comment:', commentError.message);
            }

        } catch (githubError) {
            console.error('❌ GitHub issue creation failed:', githubError.message);
            
            // Delete the database entry if GitHub creation fails
            await BountyIssue.findByIdAndDelete(bountyIssue._id);
            
            return res.status(500).json({
                success: false,
                message: 'Failed to create GitHub issue',
                error: githubError.message
            });
        }

        // Step 3: Lock funds on Stellar (TODO: Implement contract integration)
        try {
            // TODO: Call Stellar contract to lock bounty funds
            // For now, we'll simulate success
            
            const mockTxHash = `STELLAR_TX_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            bountyIssue.stellarTxHash = mockTxHash;
            bountyIssue.contractBountyId = bountyIssue._id.toString();
            bountyIssue.status = 'open';
            await bountyIssue.save();

            console.log('✅ Stellar transaction simulated:', mockTxHash);

        } catch (stellarError) {
            console.error('❌ Stellar transaction failed:', stellarError.message);
            
            // Issue was created on GitHub but blockchain failed
            // Keep the database entry but mark as failed
            bountyIssue.status = 'pending_blockchain';
            bountyIssue.notes = `Stellar transaction failed: ${stellarError.message}`;
            await bountyIssue.save();
            
            return res.status(500).json({
                success: false,
                message: 'GitHub issue created but blockchain transaction failed',
                error: stellarError.message,
                issue_id: bountyIssue._id,
                github_url: bountyIssue.githubIssueUrl
            });
        }

        // Success! Return complete info
        res.status(201).json({
            success: true,
            message: 'Bounty issue created successfully',
            issue_id: bountyIssue._id,
            github_issue_number: bountyIssue.githubIssueNumber,
            github_url: bountyIssue.githubIssueUrl,
            stellar_tx_hash: bountyIssue.stellarTxHash,
            status: bountyIssue.status
        });

    } catch (error) {
        console.error('Error creating bounty issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create bounty issue',
            error: error.message
        });
    }
});

/**
 * GET /api/bounty-issues
 * Get all bounty issues (with filters)
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { status, repo, created_by_me, assigned_to_me, page = 1, limit = 20 } = req.query;
        
        const query = {};
        
        if (status) {
            query.status = status;
        }
        
        if (repo) {
            query.repoFullName = repo;
        }
        
        if (created_by_me === 'true') {
            query.creatorId = req.user.userId;
        }
        
        if (assigned_to_me === 'true') {
            query.assigneeId = req.user.userId;
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [issues, total] = await Promise.all([
            BountyIssue.find(query)
                .populate('creatorId', 'github avatar')
                .populate('assigneeId', 'github avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            BountyIssue.countDocuments(query)
        ]);
        
        res.json({
            success: true,
            issues,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Error fetching bounty issues:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bounty issues',
            error: error.message
        });
    }
});

/**
 * GET /api/bounty-issues/public/:id
 * Get single bounty issue (PUBLIC - no auth required)
 */
router.get('/public/:id', async (req, res) => {
    try {
        const issue = await BountyIssue.findById(req.params.id)
            .populate('creatorId', 'github avatar')
            .populate('assigneeId', 'github avatar');
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Bounty issue not found'
            });
        }
        
        // Return public-safe data
        res.json({
            success: true,
            issue: {
                _id: issue._id,
                repoFullName: issue.repoFullName,
                githubIssueNumber: issue.githubIssueNumber,
                githubIssueUrl: issue.githubIssueUrl,
                title: issue.title,
                description: issue.description,
                difficulty: issue.difficulty,
                skills: issue.skills,
                bountyAmount: issue.bountyAmount,
                deadline: issue.deadline,
                status: issue.status,
                creatorId: issue.creatorId,
                assigneeId: issue.assigneeId,
                assignedAt: issue.assignedAt,
                createdAt: issue.createdAt,
                updatedAt: issue.updatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching public bounty:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bounty issue',
            error: error.message
        });
    }
});

/**
 * GET /api/bounty-issues/stats
 * Get platform-wide statistics (PUBLIC - no auth required)
 * Note: This route MUST come before /:id route to avoid matching 'stats' as an ID
 */
router.get('/stats', async (req, res) => {
    try {
        // Get all bounties
        const allBounties = await BountyIssue.find({});
        
        // Calculate stats
        const totalBounties = allBounties.length;
        
        // Active bounties (open and in_progress)
        const activeBounties = allBounties.filter(b => 
            b.status === 'open' || b.status === 'in_progress'
        ).length;
        
        // Total rewards paid (completed bounties)
        const completedBounties = allBounties.filter(b => b.status === 'completed');
        const totalRewards = completedBounties.reduce((sum, b) => sum + (b.bountyAmount || 0), 0);
        
        // Active users (unique creators and assignees)
        const creators = new Set(allBounties.map(b => b.creatorId?.toString()).filter(Boolean));
        const assignees = new Set(allBounties.map(b => b.assigneeId?.toString()).filter(Boolean));
        const activeUsers = new Set([...creators, ...assignees]).size;
        
        // Get total users from database
        const totalUsers = await User.countDocuments({});
        
        res.json({
            success: true,
            stats: {
                totalBounties,
                activeBounties,
                totalRewards: Math.round(totalRewards * 100) / 100, // Round to 2 decimals
                activeUsers: activeUsers || totalUsers, // Use active users or total users as fallback
                completedBounties: completedBounties.length,
                totalUsers
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch statistics',
            error: error.message
        });
    }
});

/**
 * GET /api/bounty-issues/:id
 * Get single bounty issue (AUTHENTICATED)
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const issue = await BountyIssue.findById(req.params.id)
            .populate('creatorId', 'github avatar email')
            .populate('assigneeId', 'github avatar email');
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Bounty issue not found'
            });
        }
        
        res.json({
            success: true,
            issue
        });
    } catch (error) {
        console.error('Error fetching bounty issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bounty issue',
            error: error.message
        });
    }
});

/**
 * PATCH /api/bounty-issues/:id/assign
 * Assign bounty issue to a user
 */
router.patch('/:id/assign', authenticateToken, async (req, res) => {
    try {
        const { assignee_id } = req.body;
        
        const issue = await BountyIssue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Bounty issue not found'
            });
        }
        
        // Only creator can assign
        if (issue.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can assign this issue'
            });
        }
        
        if (issue.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Issue is not open for assignment'
            });
        }
        
        issue.assigneeId = assignee_id;
        issue.assignedAt = new Date();
        issue.status = 'in_progress';
        await issue.save();
        
        res.json({
            success: true,
            message: 'Issue assigned successfully',
            issue
        });
    } catch (error) {
        console.error('Error assigning issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign issue',
            error: error.message
        });
    }
});

/**
 * PATCH /api/bounty-issues/:id/complete
 * Mark bounty issue as completed
 */
router.patch('/:id/complete', authenticateToken, async (req, res) => {
    try {
        const { pr_number, pr_url } = req.body;
        
        const issue = await BountyIssue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Bounty issue not found'
            });
        }
        
        // Only creator can mark as complete
        if (issue.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can complete this issue'
            });
        }
        
        issue.prNumber = pr_number;
        issue.prUrl = pr_url;
        issue.completedAt = new Date();
        issue.status = 'completed';
        await issue.save();
        
        // TODO: Release funds from Stellar contract
        
        res.json({
            success: true,
            message: 'Issue marked as completed',
            issue
        });
    } catch (error) {
        console.error('Error completing issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete issue',
            error: error.message
        });
    }
});

/**
 * DELETE /api/bounty-issues/:id
 * Delete/cancel a bounty issue
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const issue = await BountyIssue.findById(req.params.id);
        
        if (!issue) {
            return res.status(404).json({
                success: false,
                message: 'Bounty issue not found'
            });
        }
        
        // Only creator can delete
        if (issue.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the creator can delete this issue'
            });
        }
        
        // Delete from database
        await BountyIssue.findByIdAndDelete(req.params.id);
        
        res.json({
            success: true,
            message: 'Bounty issue deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting issue:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete issue',
            error: error.message
        });
    }
});

module.exports = router;
