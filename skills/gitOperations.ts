import { Express } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function gitOperationsSkill(app: Express) {
    app.post('/api/git-sync', async (req: any, res: any) => {
        try {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({
                    error: 'Commit message is required'
                });
            }

            // Execute git commands
            await execAsync('git add .');
            await execAsync(`git commit -m "${message}"`);
            await execAsync('git push');

            console.log('Successfully committed and pushed changes');

            res.json({
                success: true,
                message: 'Changes committed and pushed successfully'
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
