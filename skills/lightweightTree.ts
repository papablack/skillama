import fs from 'fs';
import path from 'path';

function listDirectories(dirPath: string): string {
    const name = path.basename(dirPath);
    let output = name + '\n';
    
    try {
        const children = fs.readdirSync(dirPath)
            .filter(child => {
                const childPath = path.join(dirPath, child);
                return !child.startsWith('.') && fs.statSync(childPath).isDirectory();
            })
            .sort();

        children.forEach((child, index) => {
            const isLast = index === children.length - 1;
            const prefix = '  ';
            const marker = isLast ? '└── ' : '├── ';
            output += prefix + marker + child + '\n';
        });

        return output;
    } catch (error) {
        console.error(`Error processing ${dirPath}:`, error);
        throw error;
    }
}

export function generateLightweightTree(rootPath: string): string {
    try {
        if (!fs.existsSync(rootPath)) {
            throw new Error(`Directory does not exist: ${rootPath}`);
        }
        return listDirectories(rootPath).trim();
    } catch (error) {
        console.error('Error generating tree:', error);
        throw error;
    }
}
