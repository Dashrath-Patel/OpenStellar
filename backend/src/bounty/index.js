const BountyModel = require("../models/bounty");
const WorkModel = require("../models/work");
const ProjectModel = require("../models/project");
const TransactionModel = require("../models/transaction");
const { addLog } = require('../log');
const { createGitHubIssue, formatBountyIssueBody, addLabelsToIssue } = require('../github');

async function createBounty(creatorId, bountyId, 
    title, payAmount, startDate, endDate, 
    type, difficulty, topic, 
    description, gitHub, 
    block, status, 
    projectId, skills, requirements
) {
    // check existence
    const oldBounty = await BountyModel.findOne({bountyId: bountyId});
    if (oldBounty !== null) {
        await oldBounty.populate('creator');
        throw new Error(`${oldBounty.creator.name ? oldBounty.creator.name: oldBounty.creator.wallet} has already added the bounty`);
    }
    
    // create new bounty in database first
    const newBounty = new BountyModel({
        creator: creatorId, 
        bountyId: bountyId, 
        title: title, 
        payAmount: payAmount, 
        startDate: startDate, 
        endDate: endDate, 
        type: type, 
        topic: topic, 
        difficulty: difficulty, 
        description: description, 
        gitRepo: gitHub, 
        block: block, 
        status: status || 'pending_github',
        projectId: projectId,
        skills: skills || [],
        requirements: requirements || []
    });
    await newBounty.save();

    await addLog(creatorId, startDate, 'Create', newBounty._id, null, '');

    return newBounty;
}

async function getRecentBounties() {
    const posts = await BountyModel.find({}, {}, {sort: {createdAt: -1}, limit: 10, skip: 0}).populate('creator');
    return posts;
}

async function searchBounties(param) {
    const allBounties = await BountyModel.find({}, {}, {sort: {createdAt: -1}, skip: 0});
    
    param = (param || '').toLowerCase();
    if (param === '')
        return allBounties;
    else
        return allBounties.filter((p) => {
            return p.title.toLowerCase().includes(param)
                || (p.description || '').toLowerCase().includes(param);
        });
}

async function getAppliedBounties(user) {
    const works = await WorkModel.find({participant: user._id}).populate('bounty');
    const bounties = works.map(b => b.bounty);
    return bounties;
}

async function getBounties(filter, param, user) {
    if (filter === 'search') {
        return await searchBounties(param);
    } else if (filter === 'applied') {
        return await getAppliedBounties(user);
    } else if (filter === 'created') {
        return await BountyModel.find({creator: user._id});
    } else {
        throw new Error('Unknown filter');
    }
}

async function getSingleBounty(bountyId) {
    return await BountyModel.findOne({bountyId: bountyId}).populate('creator');
}

async function cancelBounty(bountyId, newStatus) {
    const bounty = await BountyModel.findOne({bountyId: bountyId});
    if (bounty === null) {
        throw new Error('Invalid Bounty');
    }

    bounty.status = newStatus;
    bounty.save();

    await addLog(bounty.creator, Date.now(), 'Cancel', bounty._id, null, '');

    return true;
}

async function closeBounty(bountyId, newStatus) {
    const bounty = await BountyModel.findOne({bountyId: bountyId});
    if (bounty === null) {
        throw new Error('Invalid Bounty');
    }

    bounty.status = newStatus;
    bounty.save();

    await addLog(bounty.creator, Date.now(), 'Close', bounty._id, null, '');

    return true;
}

/**
 * Create GitHub issue for bounty
 */
async function createBountyGitHubIssue(bountyId, maintainerAccessToken) {
    const bounty = await BountyModel.findOne({bountyId: bountyId}).populate('creator projectId');
    if (!bounty) {
        throw new Error('Bounty not found');
    }
    
    if (!bounty.projectId) {
        throw new Error('Bounty not linked to a project');
    }
    
    const project = bounty.projectId;
    
    // Format issue body
    const issueBody = formatBountyIssueBody({
        payAmount: bounty.payAmount,
        difficulty: bounty.difficulty,
        endDate: bounty.endDate,
        description: bounty.description,
        requirements: bounty.requirements,
        skills: bounty.skills,
        gitRepo: bounty.gitRepo,
        bountyId: bounty.bountyId
    });
    
    // Create GitHub issue
    const githubIssue = await createGitHubIssue(
        maintainerAccessToken,
        project.githubOwner,
        project.githubRepo,
        {
            title: bounty.title,
            body: issueBody,
            labels: ['bounty', `difficulty-${bounty.difficulty}`]
        }
    );
    
    // Update bounty with GitHub info
    bounty.githubIssueNumber = githubIssue.number;
    bounty.githubIssueUrl = githubIssue.html_url;
    bounty.githubIssueId = githubIssue.id.toString();
    bounty.status = 'pending_blockchain';
    await bounty.save();
    
    return githubIssue;
}

/**
 * Assign bounty to contributor (both GitHub and database)
 */
async function assignBounty(bountyId, contributorId, maintainerAccessToken) {
    const bounty = await BountyModel.findOne({bountyId: bountyId}).populate('projectId');
    if (!bounty) {
        throw new Error('Bounty not found');
    }
    
    // Get contributor's GitHub username
    const UserModel = require('../models/user');
    const contributor = await UserModel.findById(contributorId);
    if (!contributor || !contributor.github) {
        throw new Error('Contributor GitHub username not found');
    }
    
    // Assign on GitHub if issue exists
    if (bounty.githubIssueNumber && bounty.projectId) {
        const { assignGitHubIssue } = require('../github');
        await assignGitHubIssue(
            maintainerAccessToken,
            bounty.projectId.githubOwner,
            bounty.projectId.githubRepo,
            bounty.githubIssueNumber,
            contributor.github
        );
    }
    
    // Update database
    bounty.assignee = contributorId;
    bounty.assignedAt = new Date();
    bounty.status = 'assigned';
    await bounty.save();
    
    await addLog(bounty.creator, Date.now(), 'Assign', bounty._id, null, `Assigned to ${contributor.name || contributor.wallet}`);
    
    return bounty;
}

/**
 * Submit PR for bounty
 */
async function submitBountyPR(bountyId, prUrl) {
    const bounty = await BountyModel.findOne({bountyId: bountyId});
    if (!bounty) {
        throw new Error('Bounty not found');
    }
    
    if (bounty.status !== 'assigned') {
        throw new Error('Bounty is not in assigned state');
    }
    
    bounty.prUrl = prUrl;
    bounty.status = 'in_review';
    await bounty.save();
    
    await addLog(bounty.creator, Date.now(), 'PRSubmit', bounty._id, null, prUrl);
    
    return bounty;
}

/**
 * Mark bounty as completed (PR merged)
 */
async function completeBounty(bountyId) {
    const bounty = await BountyModel.findOne({bountyId: bountyId});
    if (!bounty) {
        throw new Error('Bounty not found');
    }
    
    bounty.status = 'completed';
    bounty.completedAt = new Date();
    bounty.prMergedAt = new Date();
    await bounty.save();
    
    await addLog(bounty.creator, Date.now(), 'Complete', bounty._id, null, '');
    
    return bounty;
}

/**
 * Release payment for completed bounty
 */
async function releaseBountyPayment(bountyId, stellarTxHash, ledger) {
    const bounty = await BountyModel.findOne({bountyId: bountyId}).populate('creator assignee');
    if (!bounty) {
        throw new Error('Bounty not found');
    }
    
    if (bounty.status !== 'completed') {
        throw new Error('Bounty is not completed yet');
    }
    
    // Update bounty status
    bounty.status = 'paid';
    bounty.paidAt = new Date();
    bounty.stellarTxHash = stellarTxHash;
    await bounty.save();
    
    // Create transaction record
    const transaction = new TransactionModel({
        type: 'payment_release',
        bountyId: bounty._id,
        from: bounty.creator._id,
        to: bounty.assignee._id,
        amount: bounty.payAmount,
        stellarTxHash: stellarTxHash,
        stellarFrom: bounty.creator.stellarPublicKey,
        stellarTo: bounty.assignee.stellarPublicKey,
        ledger: ledger,
        status: 'confirmed',
        confirmedAt: new Date(),
        description: `Payment for bounty #${bountyId}: ${bounty.title}`
    });
    await transaction.save();
    
    // Update user stats
    const UserModel = require('../models/user');
    await UserModel.findByIdAndUpdate(bounty.assignee._id, {
        $inc: { 
            totalBountiesCompleted: 1,
            totalEarned: bounty.payAmount
        }
    });
    
    await addLog(bounty.creator._id, Date.now(), 'Payment', bounty._id, null, `Paid ${bounty.payAmount} XLM`);
    
    // Close GitHub issue if exists
    if (bounty.githubIssueNumber && bounty.projectId) {
        try {
            const project = await ProjectModel.findById(bounty.projectId);
            const creator = await UserModel.findById(bounty.creator._id);
            
            if (creator.githubAccessToken) {
                const { closeGitHubIssue, addLabelsToIssue } = require('../github');
                
                const comment = `🎉 **Bounty Paid!**\n\nPayment of ${bounty.payAmount} XLM has been released to @${bounty.assignee.github}.\n\nTransaction: [View on Stellar Explorer](https://stellar.expert/explorer/testnet/tx/${stellarTxHash})\n\nThank you for your contribution!`;
                
                await closeGitHubIssue(
                    creator.githubAccessToken,
                    project.githubOwner,
                    project.githubRepo,
                    bounty.githubIssueNumber,
                    comment
                );
                
                await addLabelsToIssue(
                    creator.githubAccessToken,
                    project.githubOwner,
                    project.githubRepo,
                    bounty.githubIssueNumber,
                    ['bounty-paid']
                );
            }
        } catch (error) {
            console.error('Error closing GitHub issue:', error);
            // Don't throw error - payment was successful
        }
    }
    
    return bounty;
}

module.exports = {
    createBounty,
    createBountyGitHubIssue,
    assignBounty,
    submitBountyPR,
    completeBounty,
    releaseBountyPayment,
    getRecentBounties,
    getBounties,
    getSingleBounty,
    cancelBounty,
    closeBounty
};
