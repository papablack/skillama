import { Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Controller, RWSRoute } from '@rws-framework/server/nest';
import * as fs from 'fs';
import * as path from 'path';
import { FileStats, ShowFileResponse } from '../types';

interface FileNode extends FileStats {
  type: 'file' | 'directory';
  children?: FileNode[];
}

const outputDir: string = path.resolve(process.cwd(), 'generated');

// @ApiTags('files')
@Controller('files')
export class TraverseController {
  private buildFileTree(dirPath: string, visited = new Set<string>()): FileNode[] {
    const normalizedPath = path.normalize(dirPath);
    if (visited.has(normalizedPath)) {
      return [];
    }
    visited.add(normalizedPath);
    
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const items = fs.readdirSync(dirPath);
    const tree: FileNode[] = [];

    for (const item of items) {
      if (item[0] === '.') {
        continue;
      }
      
      const fullPath = path.join(dirPath, item);
      try {
        const stats = fs.statSync(fullPath);
        const node: FileNode = {
          name: item,
          path: fullPath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: stats.isDirectory() ? 'directory' : 'file'
        };

        if (stats.isDirectory()) {
          node.children = this.buildFileTree(fullPath, new Set(visited));
        }
        tree.push(node);
      } catch (error) {
        console.error(`Error processing path ${fullPath}:`, error);
        continue;
      }
    }
    return tree;
  }

  private generateTreeText(nodes: FileNode[], prefix = ''): string {
    let result = '';
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const marker = isLast ? '└── ' : '├── ';
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      result += prefix + marker + node.name + '\n';
      if (node.type === 'directory' && node.children) {
        result += this.generateTreeText(node.children, newPrefix);
      }
    });
    return result;
  }

  // @ApiOperation({ summary: 'Get file list' })
  // @ApiResponse({ files: [], treeView: '', message: null })
  @RWSRoute('list_files')
  async listFiles(@Query('projectName') projectName: string): Promise<{ files: FileNode[], treeView: string, message?: string }> 
  {
    try {
      if (!projectName) {
        throw new HttpException(
          'projectName is required',
          HttpStatus.BAD_REQUEST
        );
      }

      const projectDir = path.join(outputDir, projectName);
      if (!fs.existsSync(projectDir)) {
        return {
          files: [],
          treeView: '',
          message: `Project directory ${projectName} does not exist`
        };
      }

      const fileTree = this.buildFileTree(projectDir);
      const treeView = this.generateTreeText(fileTree);
      
      console.log(`Processed list request for project ${projectName}. Listed ${fileTree.length} files.`);
      
      return {
        files: fileTree,
        treeView
      };
    } catch (error: Error | any) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // @ApiOperation({ summary: 'Get file content' })
  // @ApiResponse({ 
  //   filename: 'filename.example.ts',
  //   path: '/path/to/file',
  //   content: 'export class FileContentExample {}',
  //   size: 0,
  //   created: new Date(),
  //   modified: new Date() })
  @RWSRoute('show_file')
  async showFile(
    @Body() body: { filename: string; projectName: string }
  ): Promise<ShowFileResponse> {
    try {
      const { filename, projectName } = body;

      if (!filename || !projectName) {
        throw new HttpException(
          'Both filename and projectName are required',
          HttpStatus.BAD_REQUEST
        );
      }

      const projectDir = path.join(outputDir, projectName);
      if (!fs.existsSync(projectDir)) {
        throw new HttpException(
          `Project directory ${projectName} does not exist`,
          HttpStatus.NOT_FOUND
        );
      }

      const filePath = path.join(projectDir, filename);
      if (!fs.existsSync(filePath) || !filePath.startsWith(projectDir)) {
        throw new HttpException(
          `File ${filename} does not exist in project ${projectName}`,
          HttpStatus.NOT_FOUND
        );
      }

      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');

      console.log(`Processed file read request: ${filePath}`);

      return {
        filename,
        path: filePath,
        content,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error: Error | any) {
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}