import fs from 'fs';
import path from 'path';
import { FileStats, ShowFileResponse } from '../types';
import { Express } from 'express';

interface FileNode extends FileStats {
    type: 'file' | 'directory';
    children?: FileNode[];
}
const outputDir: string = path.resolve(process.cwd(), 'generated');

function buildFileTree(dirPath: string): FileNode[] {
    const items = fs.readdirSync(dirPath);
    const tree: FileNode[] = [];

    for (const item of items) {
        if(item[0] === '.'){
            continue;
        }
        const fullPath = path.join(dirPath, item);
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
            node.children = buildFileTree(fullPath);
        }

        tree.push(node);
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
            const filePath = path.join(outputDir, projectName, filename);
            
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    error: 'File not found',
                    details: `File ${filename} does not exist in ${outputDir}`
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

            res.json(response);

        } catch (error) {
            console.error('Error reading file:', error);
            res.status(500).json({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
}