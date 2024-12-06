import fs from 'fs';
import path from 'path';
import { FileStats, ShowFileResponse } from '../types';
import { Express } from 'express';

interface FileNode extends FileStats {
    type: 'file' | 'directory';
    children?: FileNode[];
}

const outputDir: string = path.resolve(process.cwd(), 'generated');

function buildFileTree(dirPath: string, visited = new Set<string>()): FileNode[] {
    // Prevent infinite recursion by tracking visited paths
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
        if(item[0] === '.'){
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
                // Pass a copy of the visited set to prevent cross-branch pollution
                node.children = buildFileTree(fullPath, new Set(visited));
            }

            tree.push(node);
        } catch (error) {
            console.error(`Error processing path ${fullPath}:`, error);
            // Skip this item if there's an error
            continue;
        }
    }

    return tree;
}

function generateTreeText(nodes: FileNode[], prefix = ''): string {
    let result = '';
    
    nodes.forEach((node, index) => {
        const isLast = index === nodes.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        
        result += prefix + marker + node.name + '\n';
        
        if (node.type === 'directory' && node.children) {
            result += generateTreeText(node.children, newPrefix);
        }
    });
    
    return result;
}

export function traverseFilesSkill(app: Express) {
    // List generated files endpoint
    app.get('/api/list-files', (req: any, res: any) => {        
        try {
            if (!fs.existsSync(outputDir)) {
                return res.json({ files: [], treeView: '' });
            }

            const fileTree = buildFileTree(outputDir);
            const treeView = generateTreeText(fileTree);
            console.log(`Processed list request. Listed ${fileTree.length} files.`);

            res.json({ 
                files: fileTree,
                treeView 
            });
        } catch (error) {
            console.error('Error listing files:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });

    // Show file contents endpoint
    app.post('/api/show-file', (req: any, res: any) => {
        try {
            const { filename, projectName } = req.body;

            // Validate required parameters
            if (!filename || !projectName) {
                return res.status(400).json({
                    error: 'Bad Request',
                    details: 'Both filename and projectName are required'
                });
            }

            // Ensure project directory exists
            const projectDir = path.join(outputDir, projectName);
            if (!fs.existsSync(projectDir)) {
                return res.status(404).json({
                    error: 'Project not found',
                    details: `Project directory ${projectName} does not exist`
                });
            }

            const filePath = path.join(projectDir, filename);
            
            // Ensure the file exists and is within the project directory
            if (!fs.existsSync(filePath) || !filePath.startsWith(projectDir)) {
                return res.status(404).json({
                    error: 'File not found',
                    details: `File ${filename} does not exist in project ${projectName}`
                });
            }

            const stats = fs.statSync(filePath);
            const content = fs.readFileSync(filePath, 'utf8');

            const response: ShowFileResponse = {
                filename,
                path: filePath,
                content,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            };
            console.log(`Processed file read request: ${filePath}`);

            res.status(200).json(response);

        } catch (error) {
            console.error('Error reading file:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}