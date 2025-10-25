const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const Application = require('../models/application');
const BountyIssue = require('../models/bountyIssue');
const User = require('../models/user');

/**
 * POST /api/applications
 * Submit application for a bounty
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const {
            bounty_issue_id,
            proposal,
            estimated_days,
            wallet_address,
            portfolio
        } = req.body;

        // Validation
        if (!bounty_issue_id || !proposal || !estimated_days || !wallet_address) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        if (proposal.length < 50 || proposal.length > 2000) {
            return res.status(400).json({
                success: false,
                message: 'Proposal must be between 50-2000 characters'
            });
        }

        if (estimated_days < 1 || estimated_days > 365) {
            return res.status(400).json({
                success: false,
                message: 'Estimated days must be between 1-365'
            });
        }

        // Get user
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if bounty exists
        const bounty = await BountyIssue.findById(bounty_issue_id);
        if (!bounty) {
            return res.status(404).json({
                success: false,
                message: 'Bounty not found'
            });
        }

        // Check if bounty is open
        if (bounty.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This bounty is not accepting applications'
            });
        }

        // Check if user is the creator
        if (bounty.creatorId.toString() === req.user.userId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot apply to your own bounty'
            });
        }

        // Check for existing application
        const existingApp = await Application.findOne({
            bountyIssueId: bounty_issue_id,
            applicantId: req.user.userId
        });

        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this bounty'
            });
        }

        // Create application
        const application = new Application({
            bountyIssueId: bounty_issue_id,
            applicantId: req.user.userId,
            proposal,
            estimatedDays: estimated_days,
            walletAddress: wallet_address,
            githubUsername: user.github,
            portfolio: portfolio || '',
            status: 'pending_approval'
        });

        await application.save();

        // Populate applicant details for response
        await application.populate('applicantId', 'github avatar email');

        console.log('✅ Application submitted:', application._id);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application
        });

    } catch (error) {
        console.error('Error submitting application:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this bounty'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to submit application',
            error: error.message
        });
    }
});

/**
 * GET /api/applications/bounty/:bountyId
 * Get all applications for a specific bounty (creator only)
 */
router.get('/bounty/:bountyId', authenticateToken, async (req, res) => {
    try {
        const { bountyId } = req.params;

        // Check if bounty exists and user is creator
        const bounty = await BountyIssue.findById(bountyId);
        
        if (!bounty) {
            return res.status(404).json({
                success: false,
                message: 'Bounty not found'
            });
        }

        if (bounty.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only bounty creator can view applications'
            });
        }

        // Get all applications
        const applications = await Application.find({ bountyIssueId: bountyId })
            .populate('applicantId', 'github avatar email')
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications,
            total: applications.length
        });

    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

/**
 * GET /api/applications/my
 * Get all applications by the current user
 */
router.get('/my', authenticateToken, async (req, res) => {
    try {
        const { status } = req.query;
        
        const query = { applicantId: req.user.userId };
        
        if (status) {
            query.status = status;
        }

        const applications = await Application.find(query)
            .populate({
                path: 'bountyIssueId',
                select: 'title repoFullName bountyAmount difficulty status githubIssueUrl',
                populate: {
                    path: 'creatorId',
                    select: 'github avatar'
                }
            })
            .sort({ appliedAt: -1 });

        res.json({
            success: true,
            applications,
            total: applications.length
        });

    } catch (error) {
        console.error('Error fetching my applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch applications',
            error: error.message
        });
    }
});

/**
 * PATCH /api/applications/:id/review
 * Accept or reject an application (creator only)
 */
router.patch('/:id/review', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { action, comment } = req.body; // action: 'accept' | 'reject'

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be "accept" or "reject"'
            });
        }

        // Get application
        const application = await Application.findById(id)
            .populate('bountyIssueId');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is the bounty creator
        if (application.bountyIssueId.creatorId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only bounty creator can review applications'
            });
        }

        // Check if application is still pending
        if (application.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: 'This application has already been reviewed'
            });
        }

        if (action === 'accept') {
            // Check if bounty is already assigned
            if (application.bountyIssueId.status === 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'This bounty is already assigned'
                });
            }

            // Accept application
            application.status = 'accepted';
            application.reviewComment = comment || '';
            application.reviewedAt = new Date();
            await application.save();

            // Update bounty status
            const bounty = application.bountyIssueId;
            bounty.assigneeId = application.applicantId;
            bounty.assignedApplication = application._id;
            bounty.status = 'in_progress';
            bounty.assignedAt = new Date();

            // TODO: Lock funds on Stellar blockchain
            const mockLockTxHash = `STELLAR_LOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            bounty.lockTransactionHash = mockLockTxHash;

            await bounty.save();

            // Reject all other pending applications
            await Application.updateMany(
                {
                    bountyIssueId: bounty._id,
                    _id: { $ne: application._id },
                    status: 'pending_approval'
                },
                {
                    status: 'rejected',
                    reviewComment: 'Another applicant was selected',
                    reviewedAt: new Date()
                }
            );

            console.log('✅ Application accepted and funds locked:', mockLockTxHash);

            res.json({
                success: true,
                message: 'Application accepted and bounty assigned',
                application,
                lock_tx_hash: mockLockTxHash
            });

        } else {
            // Reject application
            application.status = 'rejected';
            application.reviewComment = comment || '';
            application.reviewedAt = new Date();
            await application.save();

            console.log('✅ Application rejected:', application._id);

            res.json({
                success: true,
                message: 'Application rejected',
                application
            });
        }

    } catch (error) {
        console.error('Error reviewing application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review application',
            error: error.message
        });
    }
});

/**
 * DELETE /api/applications/:id
 * Withdraw application (applicant only, before review)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const application = await Application.findById(id);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is the applicant
        if (application.applicantId.toString() !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only withdraw your own applications'
            });
        }

        // Check if still pending
        if (application.status !== 'pending_approval') {
            return res.status(400).json({
                success: false,
                message: 'You can only withdraw pending applications'
            });
        }

        application.status = 'withdrawn';
        await application.save();

        console.log('✅ Application withdrawn:', application._id);

        res.json({
            success: true,
            message: 'Application withdrawn successfully'
        });

    } catch (error) {
        console.error('Error withdrawing application:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to withdraw application',
            error: error.message
        });
    }
});

module.exports = router;
