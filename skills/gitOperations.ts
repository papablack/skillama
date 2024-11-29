import { Express } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { createGitHubRepo } from '../inc/github';

const execAsync = promisify(exec);

export async function gitOperationsSkill(app: Express) {
  app.post('/api/git-sync', async (req: any, res: any) => {
    try {
      const { message, projectName, uuid, createRepo = false, isPrivate = false, description = '' } = req.body;
      
      console.log({reqBody: req.body})

      if (!message) {
        return res.status(400).json({
          error: 'Commit message is required'
        });
      }

      if (!projectName) {
        return res.status(400).json({
          error: 'Project name and UUID are required'
        });
      }

      const outputDir: string = path.resolve(
        process.env.OUTPUT_DIR || 
        path.resolve(__dirname, '..', 'generated'), 
        projectName
      );

      // Check if git repository exists
      const isGitRepo = fs.existsSync(path.join(outputDir, '.git'));
      const branchName = `skillama-${uuid}`;

      console.log('Starting SkilLama GIT SYNC');

      if (!isGitRepo) {
        // Create directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }        
        
        console.log('Starting GIT Repo');
        
        // Create GitHub repository if requested
        if (createRepo) {
          const repo = await createGitHubRepo(projectName, isPrivate, description);
          console.log(`Created GitHub repository: ${repo.html_url}`);
          
          // Initialize git repo and set remote
          await execAsync('git init', { cwd: outputDir });
          await execAsync(`git remote add origin ${repo.ssh_url}`, { cwd: outputDir });
        } else {
          // Just initialize local repo
          await execAsync('git init', { cwd: outputDir });
        }
        
        // Create a README.md file
        fs.writeFileSync(
          path.join(outputDir, 'README.md'), 
          `# ${projectName}\nSkillama generated repository for ${projectName}`
        );
        
        // Initial commit on main branch
        await execAsync('git add .', { cwd: outputDir });
        await execAsync('git commit -m "Initial commit"', { cwd: outputDir });
        
        // Create and switch to the skillama branch
        await execAsync(`git checkout -b ${branchName}`, { cwd: outputDir });
      } else {
        // If repo exists, try to checkout existing branch or create new one
        try {
          await execAsync(`git checkout ${branchName}`, { cwd: outputDir });
        } catch {
          await execAsync(`git checkout -b ${branchName}`, { cwd: outputDir });
        }
      }      

      // Execute git commands
      await execAsync('git add .', { cwd: outputDir });

      console.log('EXECUTE GIT CHANGES');
      await execAsync(`git commit -m "${message}"`, { cwd: outputDir });
      
      if (createRepo) {
        await execAsync(`git push -u origin ${branchName}`, { cwd: outputDir });
      }

      console.log(`Successfully committed and pushed changes to branch: ${branchName}`);
      
      res.json({
        success: true,
        message: 'Changes committed and pushed successfully',
        branchName,
        isNewRepo: !isGitRepo
      });

    } catch (error) {
      console.error('Error in git operations:', error);
      res.status(500).json({
        error: 'Git operation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}