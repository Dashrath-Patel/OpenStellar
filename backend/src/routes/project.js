const { Router } = require('express');
const ProjectModel = require('../models/project');
const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');

const router = Router();

/**
 * Middleware: Authenticate JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

/**
 * Create new project
 */
router.post('/create', authenticateToken, async (req, res) => {
    const { name, description, githubRepoUrl, tags, website } = req.body;
    
    if (!name || !githubRepoUrl) {
        return res.status(400).json({ error: 'Name and GitHub repo URL are required' });
    }
    
    try {
        // Parse GitHub URL to extract owner and repo
        const urlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
        const match = githubRepoUrl.match(urlPattern);
        
        if (!match) {
            return res.status(400).json({ error: 'Invalid GitHub repository URL' });
        }
        
        const githubOwner = match[1];
        const githubRepo = match[2].replace('.git', ''); // Remove .git if present
        
        // Check if project already exists
        const existingProject = await ProjectModel.findOne({ githubOwner, githubRepo });
        if (existingProject) {
            return res.status(400).json({ error: 'Project with this repository already exists' });
        }
        
        // Get user info
        const user = await UserModel.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Create project
        const project = new ProjectModel({
            name,
            description,
            maintainer: user._id,
            githubRepoUrl,
            githubOwner,
            githubRepo,
            tags: tags || [],
            website: website || ''
        });
        
        await project.save();
        
        res.json({
            status: 'success',
            message: 'Project created successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                githubRepoUrl: project.githubRepoUrl,
                githubOwner: project.githubOwner,
                githubRepo: project.githubRepo,
                maintainer: {
                    id: user._id,
                    name: user.name,
                    github: user.github,
                    avatar: user.avatar
                }
            }
        });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

/**
 * Get user's projects
 */
router.get('/list', authenticateToken, async (req, res) => {
    try {
        const projects = await ProjectModel.find({ maintainer: req.user.userId })
            .populate('maintainer', 'name github avatar')
            .sort({ createdAt: -1 });
        
        res.json({
            status: 'success',
            count: projects.length,
            projects: projects.map(p => ({
                id: p._id,
                name: p.name,
                description: p.description,
                githubRepoUrl: p.githubRepoUrl,
                githubOwner: p.githubOwner,
                githubRepo: p.githubRepo,
                totalBounties: p.totalBounties,
                activeBounties: p.activeBounties,
                totalPaid: p.totalPaid,
                isActive: p.isActive,
                createdAt: p.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

/**
 * Get all active projects (public)
 */
router.get('/public', async (req, res) => {
    try {
        const projects = await ProjectModel.find({ isActive: true })
            .populate('maintainer', 'name github avatar')
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.json({
            status: 'success',
            count: projects.length,
            projects: projects.map(p => ({
                id: p._id,
                name: p.name,
                description: p.description,
                githubRepoUrl: p.githubRepoUrl,
                githubOwner: p.githubOwner,
                githubRepo: p.githubRepo,
                totalBounties: p.totalBounties,
                activeBounties: p.activeBounties,
                tags: p.tags,
                website: p.website,
                maintainer: p.maintainer
            }))
        });
    } catch (error) {
        console.error('Error fetching public projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

/**
 * Get single project details
 */
router.get('/:id', async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id)
            .populate('maintainer', 'name github avatar wallet');
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({
            status: 'success',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                githubRepoUrl: project.githubRepoUrl,
                githubOwner: project.githubOwner,
                githubRepo: project.githubRepo,
                totalBounties: project.totalBounties,
                activeBounties: project.activeBounties,
                totalPaid: project.totalPaid,
                tags: project.tags,
                website: project.website,
                isActive: project.isActive,
                maintainer: project.maintainer,
                createdAt: project.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

/**
 * Update project
 */
router.put('/:id', authenticateToken, async (req, res) => {
    const { name, description, tags, website, isActive } = req.body;
    
    try {
        const project = await ProjectModel.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is the maintainer
        if (project.maintainer.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not the maintainer of this project' });
        }
        
        // Update fields
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (tags) project.tags = tags;
        if (website !== undefined) project.website = website;
        if (isActive !== undefined) project.isActive = isActive;
        project.updatedAt = new Date();
        
        await project.save();
        
        res.json({
            status: 'success',
            message: 'Project updated successfully',
            project: {
                id: project._id,
                name: project.name,
                description: project.description,
                tags: project.tags,
                website: project.website,
                isActive: project.isActive
            }
        });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

/**
 * Delete project
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const project = await ProjectModel.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is the maintainer
        if (project.maintainer.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not the maintainer of this project' });
        }
        
        // Check if project has active bounties
        if (project.activeBounties > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete project with active bounties',
                activeBounties: project.activeBounties
            });
        }
        
        await project.deleteOne();
        
        res.json({
            status: 'success',
            message: 'Project deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

module.exports = router;
