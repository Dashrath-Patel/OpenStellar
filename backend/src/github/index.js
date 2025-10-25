const axios = require('axios');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * GitHub OAuth - Exchange code for access token
 */
async function getAccessToken(code, clientId, clientSecret) {
    try {
        const response = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: clientId,
                client_secret: clientSecret,
                code: code
            },
            {
                headers: {
                    Accept: 'application/json'
                }
            }
        );
        
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting GitHub access token:', error.response?.data || error.message);
        throw new Error('Failed to get GitHub access token');
    }
}

/**
 * Get GitHub user info
 */
async function getGitHubUser(accessToken) {
    try {
        const response = await axios.get(`${GITHUB_API_BASE}/user`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Error getting GitHub user:', error.response?.data || error.message);
        throw new Error('Failed to get GitHub user info');
    }
}

/**
 * Create GitHub Issue
 */
async function createGitHubIssue(accessToken, owner, repo, issueData) {
    try {
        const response = await axios.post(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
            {
                title: issueData.title,
                body: issueData.body,
                labels: issueData.labels || []
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error creating GitHub issue:', error.response?.data || error.message);
        throw new Error('Failed to create GitHub issue');
    }
}

/**
 * Assign GitHub Issue to user
 */
async function assignGitHubIssue(accessToken, owner, repo, issueNumber, assignees) {
    try {
        const response = await axios.post(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
            {
                assignees: Array.isArray(assignees) ? assignees : [assignees]
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error assigning GitHub issue:', error.response?.data || error.message);
        throw new Error('Failed to assign GitHub issue');
    }
}

/**
 * Unassign GitHub Issue
 */
async function unassignGitHubIssue(accessToken, owner, repo, issueNumber, assignees) {
    try {
        const response = await axios.delete(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/assignees`,
            {
                data: {
                    assignees: Array.isArray(assignees) ? assignees : [assignees]
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error unassigning GitHub issue:', error.response?.data || error.message);
        throw new Error('Failed to unassign GitHub issue');
    }
}

/**
 * Add comment to GitHub Issue
 */
async function addGitHubComment(accessToken, owner, repo, issueNumber, comment) {
    try {
        const response = await axios.post(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
            {
                body: comment
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error adding GitHub comment:', error.response?.data || error.message);
        throw new Error('Failed to add GitHub comment');
    }
}

/**
 * Get Pull Request details
 */
async function getPullRequest(accessToken, owner, repo, prNumber) {
    try {
        const response = await axios.get(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${prNumber}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error getting pull request:', error.response?.data || error.message);
        throw new Error('Failed to get pull request details');
    }
}

/**
 * Close GitHub Issue
 */
async function closeGitHubIssue(accessToken, owner, repo, issueNumber, comment) {
    try {
        // Add comment if provided
        if (comment) {
            await addGitHubComment(accessToken, owner, repo, issueNumber, comment);
        }
        
        // Close issue
        const response = await axios.patch(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
            {
                state: 'closed'
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error closing GitHub issue:', error.response?.data || error.message);
        throw new Error('Failed to close GitHub issue');
    }
}

/**
 * Add labels to GitHub Issue
 */
async function addLabelsToIssue(accessToken, owner, repo, issueNumber, labels) {
    try {
        const response = await axios.post(
            `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/labels`,
            {
                labels: labels
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error adding labels:', error.response?.data || error.message);
        throw new Error('Failed to add labels to issue');
    }
}

/**
 * Format bounty issue body
 */
function formatBountyIssueBody(bountyData) {
    // Map difficulty levels
    const difficultyMap = {
        'easy': '🟢 Easy',
        'medium': '🟡 Medium',
        'hard': '🔴 Hard'
    };
    const difficulty = difficultyMap[bountyData.difficulty] || '❓ Unknown';
    
    // Format deadline
    let deadlineText = 'No deadline set';
    if (bountyData.endDate) {
        try {
            const date = new Date(bountyData.endDate);
            if (!isNaN(date.getTime())) {
                deadlineText = date.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
            }
        } catch (e) {
            deadlineText = 'No deadline set';
        }
    }
    
    return `
## 💰 Bounty Details

**Reward:** ${bountyData.payAmount || 0} XLM
**Difficulty:** ${difficulty}
**Deadline:** ${deadlineText}

## 📝 Description

${bountyData.description || 'No description provided'}

${bountyData.requirements && bountyData.requirements.length > 0 ? `
## ✅ Requirements

${bountyData.requirements.map(req => `- ${req}`).join('\n')}
` : ''}

${bountyData.skills && bountyData.skills.length > 0 ? `
## 🛠️ Required Skills

${bountyData.skills.map(skill => `\`${skill}\``).join(', ')}
` : ''}

---

**🎯 How to claim this bounty:**
1. Comment on this issue to request assignment
2. Wait for maintainer approval
3. Fork the repository and create your solution
4. Submit a pull request referencing this issue
5. Once merged, payment will be released automatically

**Repository:** ${bountyData.gitRepo || 'Not specified'}
**Platform:** [View on OpenStellar](${process.env.FRONTEND_URL || 'http://localhost:5173'}/bounty/${bountyData.bountyId})

*This is an automated bounty issue created through OpenStellar*
`;
}

/**
 * Get user's GitHub repositories
 * Fetches all repos where user has push access (can create issues)
 */
async function getUserRepositories(accessToken, page = 1, perPage = 100) {
    try {
        const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            },
            params: {
                per_page: perPage,
                page: page,
                sort: 'updated',
                affiliation: 'owner,collaborator'
                // Note: Cannot use 'type' param with 'affiliation'
            }
        });
        
        // Filter only repos where user has push permission (can create issues)
        const writableRepos = response.data.filter(repo => 
            repo.permissions && repo.permissions.push === true
        );
        
        return writableRepos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error.response?.data || error.message);
        throw new Error('Failed to fetch GitHub repositories');
    }
}

/**
 * Check if user has write access to a specific repository
 */
async function hasRepoAccess(accessToken, owner, repo) {
    try {
        const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
        
        return response.data.permissions && response.data.permissions.push === true;
    } catch (error) {
        console.error('Error checking repo access:', error.response?.data || error.message);
        return false;
    }
}

module.exports = {
    getAccessToken,
    getGitHubUser,
    createGitHubIssue,
    assignGitHubIssue,
    unassignGitHubIssue,
    addGitHubComment,
    getPullRequest,
    closeGitHubIssue,
    addLabelsToIssue,
    formatBountyIssueBody,
    getUserRepositories,
    hasRepoAccess
};
