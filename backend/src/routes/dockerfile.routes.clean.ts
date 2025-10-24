import { Router, Request, Response } from 'express';
import { DockerfileModel } from '../models/dockerfile.model';
import { DockerService } from '../services/docker.service';

interface GenerateRequest extends Request {
    body: {
        repositoryUrl: string;
        githubToken: string;
    };
}

const router = Router();
const dockerService = new DockerService();

router.post('/generate', async (req: GenerateRequest, res: Response) => {
    try {
        const { repositoryUrl, githubToken } = req.body;
        // Generate Dockerfile only (do not build here) so frontend can show separate progress stages
        const repoDir = await dockerService.cloneRepository(repositoryUrl, githubToken);
        try {
            const techStack = await dockerService.detectTechStack(repoDir);
            const dockerfile = await dockerService.generateDockerfile(techStack, repoDir);

            const newDockerfile = new DockerfileModel({ repositoryUrl, dockerfile, techStack });
            await newDockerfile.save();

            // Return dockerfile and tech stack; frontend can call /build next
            res.json({ success: true, data: { dockerfile, techStack } });
        } finally {
            dockerService.cleanup(repoDir);
        }
    } catch (error: any) {
        console.error('Error generating Dockerfile:', error);
        res.status(500).json({ success: false, error: error.message || 'Failed to generate Dockerfile' });
    }
});

// Build endpoint: clones repo, writes Dockerfile and runs buildImage
router.post('/build', async (req: Request, res: Response) => {
    try {
        const { repositoryUrl, githubToken, dockerfile } = req.body as { repositoryUrl: string; githubToken?: string; dockerfile: string };
        if (!repositoryUrl || !dockerfile) return res.status(400).json({ success: false, error: 'repositoryUrl and dockerfile are required' });

        const repoDir = await dockerService.cloneRepository(repositoryUrl, githubToken);
        try {
            // Write Dockerfile to repo and run build
            await dockerService.buildImage(dockerfile, repoDir);
            return res.json({ success: true, data: { message: 'Build completed' } });
        } finally {
            dockerService.cleanup(repoDir);
        }
    } catch (err: any) {
        console.error('Build failed:', err);
        res.status(500).json({ success: false, error: err.message || 'Build failed' });
    }
});

router.post('/push', async (req: Request, res: Response) => {
    try {
        const { repositoryUrl, githubToken, dockerfile } = req.body as { repositoryUrl: string; githubToken?: string; dockerfile: string };
        if (!repositoryUrl || !dockerfile) return res.status(400).json({ success: false, error: 'repositoryUrl and dockerfile are required' });

        const result = await dockerService.pushDockerfile(repositoryUrl, githubToken, dockerfile);
        res.json({ success: true, data: result });
    } catch (err: any) {
        console.error('Push failed:', err);
        res.status(500).json({ success: false, error: err.message || 'Push failed' });
    }
});

export default router;
