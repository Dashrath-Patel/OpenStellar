const express = require('express');
const router = express.Router();
const { getUserRepositories, hasRepoAccess } = require('../github');
const { authenticateToken } = require('./auth');
const User = require('../models/user');
const BountyIssue = require('../models/bountyIssue');

/**
 * GET /api/github/repos
 * Fetch user's GitHub repositories with bounty stats
 */
router.get('/repos', authenticateToken, async (req, res) => {
    try {
        const { page = 1, per_page = 30 } = req.query;
        
        // Get user with GitHub token
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.githubAccessToken) {
            return res.status(401).json({
                success: false,
                message: 'GitHub account not connected'
            });
        }

        // Fetch repos from GitHub
        const repos = await getUserRepositories(user.githubAccessToken, parseInt(page), parseInt(per_page));
        
        // Get bounty stats for each repo
        const reposWithStats = await Promise.all(repos.map(async (repo) => {
            const bountyStats = await BountyIssue.aggregate([
                { $match: { repoFullName: repo.full_name } },
                {
                    $group: {
                        _id: null,
                        activeBounties: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'open'] }, 1, 0]
                            }
                        },
                        totalBountyAmount: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'open'] }, '$bountyAmount', 0]
                            }
                        },
                        completedBounties: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                            }
                        },
                        inProgressBounties: {
                            $sum: {
                                $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            const stats = bountyStats[0] || {
                activeBounties: 0,
                totalBountyAmount: 0,
                completedBounties: 0,
                inProgressBounties: 0
            };

            return {
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                private: repo.private,
                html_url: repo.html_url,
                has_issues: repo.has_issues,
                permissions: repo.permissions,
                updated_at: repo.updated_at,
                active_bounties: stats.activeBounties,
                total_bounty_amount: stats.totalBountyAmount,
                completed_bounties: stats.completedBounties,
                in_progress_bounties: stats.inProgressBounties
            };
        }));

        res.json({
            success: true,
            repos: reposWithStats,
            total: reposWithStats.length,
            page: parseInt(page)
        });
    } catch (error) {
        console.error('Error fetching repos:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch repositories',
            error: error.message
        });
    }
});

/**
 * GET /api/github/repos/:owner/:repo
 * Get specific repository details
 */
router.get('/repos/:owner/:repo', authenticateToken, async (req, res) => {
    try {
        const { owner, repo } = req.params;
        
        const user = await User.findById(req.user.userId);
        
        if (!user || !user.githubAccessToken) {
            return res.status(401).json({
                success: false,
                message: 'GitHub account not connected'
            });
        }

        const hasAccess = await hasRepoAccess(user.githubAccessToken, owner, repo);
        
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                message: 'No write access to this repository'
            });
        }

        res.json({
            success: true,
            hasAccess: true
        });
    } catch (error) {
        console.error('Error checking repo access:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check repository access',
            error: error.message
        });
    }
});

module.exports = router;
