import { Express } from 'express';
import * as fs from 'fs';
import * as path from 'path';

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    children?: FileNode[];
    path: string;
}

// Directories to ignore
const IGNORED_DIRECTORIES = ['node_modules'];

export function traverseFilesSkill(app: Express) {
    const outputDir: string = process.env.OUTPUT_DIR || path.resolve(__dirname, '..', 'generated');

    // List generated files endpoint
    app.get('/api/list-files', (req: any, res: any) => {        
        try {
            if (!fs.existsSync(outputDir)) {
                return res.json({ files: [], treeView: '' });
            }

            const fileTree = traverseDirectory(outputDir);
            const treeView = generateTreeView(fileTree);
            
            console.log(`Processed list request. Found ${countFiles(fileTree)} items.`);

            res.json({ 
                files: flattenFileTree(fileTree),
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
}

function traverseDirectory(dirPath: string): FileNode {
    const name = path.basename(dirPath);
    const stats = fs.statSync(dirPath);

    // Skip ignored directories
    if (IGNORED_DIRECTORIES.includes(name)) {
        return {
            name,
            type: 'directory',
            path: dirPath,
            children: []
        };
    }

    if (stats.isFile()) {
        return {
            name,
            type: 'file',
            path: dirPath
        };
    }

    const children = fs.readdirSync(dirPath)
        .filter(child => !IGNORED_DIRECTORIES.includes(child)) // Filter out ignored directories
        .map(child => traverseDirectory(path.join(dirPath, child)))
        .sort((a, b) => {
            // Directories first, then files, both in alphabetical order
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });

    return {
        name,
        type: 'directory',
        children,
        path: dirPath
    };
}

function generateTreeView(node: FileNode, prefix: string = ''): string {
    // Skip empty directories (like node_modules)
    if (node.type === 'directory' && (!node.children || node.children.length === 0)) {
        return '';
    }

    let result = prefix + '├── ' + node.name + '\n';
    
    if (node.type === 'directory' && node.children) {
        const childPrefix = prefix + '│   ';
        node.children.forEach((child, index) => {
            if (index === node.children!.length - 1) {
                const childTree = generateTreeView(child, '').trim();
                if (childTree) {
                    result += prefix + '└── ' + childTree + '\n';
                }
            } else {
                result += generateTreeView(child, childPrefix);
            }
        });
    }
    
    return result;
}

function flattenFileTree(node: FileNode): string[] {
    if (node.type === 'file') {
        return [node.path];
    }

    if (node.type === 'directory' && node.children) {
        return node.children.reduce<string[]>((acc, child) => {
            return [...acc, ...flattenFileTree(child)];
        }, []);
    }

    return [];
}

function countFiles(node: FileNode): number {
    if (node.type === 'file') {
        return 1;
    }

    if (node.type === 'directory' && node.children) {
        return node.children.reduce((sum, child) => sum + countFiles(child), 0);
    }

    return 0;
}