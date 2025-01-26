import { Post, Get, Body, Res, HttpStatus, HttpException } from '@nestjs/common';
import { Controller, RWSRoute } from '@rws-framework/server/nest';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { promptAI } from '../inc/ai';
import { createGitHubRepo } from '../inc/github';


const execAsync = promisify(exec);
const outputDir: string = path.resolve(process.cwd(), 'generated');

//@ApiTags('app')
@Controller('app')
export class AppController {
  // @ApiOperation({ summary: 'Checks server status' })
  // @ApiResponse({ status: 'OK', message: 'Server is running' })
  @RWSRoute('healthcheck')
  async healthCheck() {
    return { status: 'OK', message: 'Server is running' };
  }

  @RWSRoute('generate_code')
  async generateCode(
    @Body() body: { prompt: string; filename: string; projectName: string },
    @Res() res: Response,
  ) {
    try {
      const { prompt, filename, projectName } = body;

      if (!prompt || !filename || !projectName) {
        throw new HttpException(
          'Prompt, filename, and projectName are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const projectDir = path.join(outputDir, projectName);
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
      }

      console.log('Processing code request...');
      const generatedCode = await promptAI(prompt);

      const filePath = path.join(projectDir, filename);
      const fileDir = path.dirname(filePath);
      
      if (!fs.existsSync(fileDir)) {
        fs.mkdirSync(fileDir, { recursive: true });
      }

      fs.writeFileSync(filePath, generatedCode);
      console.log(`Code generated and saved @ "${filePath}"`);

      return res.json({
        message: 'Code generated and saved successfully',
        filePath,
        code: generatedCode,
      });
    } catch (error: Error | any) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @RWSRoute('git_sync')
  async gitSync(
    @Body() body: {
      message: string;
      projectName: string;
      uuid: string;
      createRepo?: boolean;
      isPrivate?: boolean;
      description?: string;
    },
    @Res() res: Response,
  ) {
    try {
      const {
        message,
        projectName,
        uuid,
        createRepo = false,
        isPrivate = false,
        description = '',
      } = body;

      if (!message) {
        throw new HttpException('Commit message is required', HttpStatus.BAD_REQUEST);
      }

      if (!projectName) {
        throw new HttpException(
          'Project name and UUID are required',
          HttpStatus.BAD_REQUEST,
        );
      }

      const outputDir: string = path.resolve(
        process.env.OUTPUT_DIR || path.resolve(process.cwd(), 'generated'),
        projectName,
      );

      const isGitRepo = fs.existsSync(path.join(outputDir, '.git'));
      const branchName = `skillama-${uuid}`;

      console.log('Starting SkilLama GIT SYNC');

      if (!isGitRepo) {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log('Starting GIT Repo');

        if (createRepo) {
          const repo = await createGitHubRepo(projectName, isPrivate, description);
          console.log(`Created GitHub repository: ${repo.html_url}`);

          await execAsync('git init', { cwd: outputDir });
          await execAsync(`git remote add origin ${repo.ssh_url}`, { cwd: outputDir });
        } else {
          await execAsync('git init', { cwd: outputDir });
        }

        fs.writeFileSync(
          path.join(outputDir, 'README.md'),
          `# ${projectName}\nSkillama generated repository for ${projectName}`,
        );

        await execAsync('git add .', { cwd: outputDir });
        await execAsync('git commit -m "Initial commit"', { cwd: outputDir });
        await execAsync(`git checkout -b ${branchName}`, { cwd: outputDir });
      } else {
        try {
          await execAsync(`git checkout ${branchName}`, { cwd: outputDir });
        } catch {
          await execAsync(`git checkout -b ${branchName}`, { cwd: outputDir });
        }
      }

      await execAsync('git add .', { cwd: outputDir });
      await execAsync(`git commit -m "${message}"`, { cwd: outputDir });

      if (createRepo) {
        await execAsync(`git push -u origin ${branchName}`, { cwd: outputDir });
      }

      console.log(`Successfully committed and pushed changes to branch: ${branchName}`);

      return res.json({
        success: true,
        message: 'Changes committed and pushed successfully',
        branchName,
        isNewRepo: !isGitRepo,
      });
    } catch (error: Error | any) {
      throw new HttpException(
        error.message || 'Git operation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}