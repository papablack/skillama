import { expect, test, describe, beforeEach, mock } from "bun:test";
import express from 'express';
import fs from 'fs';
import path from 'path';
import { traverseFilesSkill } from '../src/skills/traverseFiles';

// Create mock functions for fs module
const mockExistsSync = mock<(path: string) => boolean>(() => true);
const mockReaddirSync = mock<(path: string) => string[]>(() => []);
const mockStatSync = mock<(path: string) => any>(() => ({
    size: 100,
    birthtime: new Date(),
    mtime: new Date(),
    isDirectory: () => false
}));
const mockReadFileSync = mock<(path: string) => string>(() => '');

// Create mock functions for path module
const mockResolve = mock<(...args: string[]) => string>((...args: string[]) => args.join('/'));
const mockJoin = mock<(...args: string[]) => string>((...args: string[]) => args.join('/'));

// Replace the actual fs and path methods with our mocks
(fs as any).existsSync = mockExistsSync;
(fs as any).readdirSync = mockReaddirSync;
(fs as any).statSync = mockStatSync;
(fs as any).readFileSync = mockReadFileSync;
(path as any).resolve = mockResolve;
(path as any).join = mockJoin;

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    size: number;
    created: Date;
    modified: Date;
    children?: FileNode[];
}

describe('traverseFiles Skill', () => {
    let app: express.Express;
    let mockReq: any;
    let mockRes: any;
    let jsonMock: any;
    let statusMock: any;
    let mockDate: Date;

    beforeEach(() => {
        // Reset all mocks
        mockExistsSync.mockReset();
        mockReaddirSync.mockReset();
        mockStatSync.mockReset();
        mockReadFileSync.mockReset();
        mockResolve.mockReset();
        mockJoin.mockReset();
        
        // Create a new Express app instance
        app = express();
        
        // Initialize mock request and response
        jsonMock = mock(() => {});
        statusMock = mock(() => ({ json: jsonMock }));
        
        mockReq = {
            body: {}
        };
        
        mockRes = {
            json: jsonMock,
            status: statusMock
        };

        // Set up default mock date
        mockDate = new Date();

        // Default mock implementations
        mockResolve.mockImplementation((...args) => args.join('/'));
        mockJoin.mockImplementation((...args) => args.join('/'));
        mockStatSync.mockImplementation(() => ({
            size: 100,
            birthtime: mockDate,
            mtime: mockDate,
            isDirectory: () => false
        }));
    });

    describe('GET /api/list-files', () => {
        test('should return empty array and tree view when output directory does not exist', () => {
            mockExistsSync.mockImplementation(() => false);

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const listFilesRoute = routes.find(r => r.route.path === '/api/list-files');
            listFilesRoute.route.stack[0].handle(mockReq, mockRes);

            expect(jsonMock).toHaveBeenCalledWith({
                files: [],
                treeView: ''
            });
        });

        test('should return file tree and tree view when directory exists', () => {
            mockExistsSync.mockImplementation(() => true);
            mockReaddirSync.mockImplementation(() => ['file1.txt', 'dir1']);
            mockStatSync.mockImplementation((filePath: string) => ({
                size: 100,
                birthtime: mockDate,
                mtime: mockDate,
                isDirectory: () => filePath.endsWith('/dir1')
            }));

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const listFilesRoute = routes.find(r => r.route.path === '/api/list-files');
            listFilesRoute.route.stack[0].handle(mockReq, mockRes);

            const expectedFiles = [
                {
                    name: 'file1.txt',
                    path: expect.any(String),
                    type: 'file',
                    size: 100,
                    created: mockDate,
                    modified: mockDate
                },
                {
                    name: 'dir1',
                    path: expect.any(String),
                    type: 'directory',
                    size: 100,
                    created: mockDate,
                    modified: mockDate,
                    children: []
                }
            ];

            expect(jsonMock).toHaveBeenCalledWith({
                files: expectedFiles,
                treeView: expect.any(String)
            });
        });

        test('should handle nested directory structures correctly', () => {
            mockExistsSync.mockImplementation(() => true);
            mockReaddirSync.mockImplementation((dirPath: string) => {
                const normalizedPath = dirPath.replace(/\\/g, '/');
                if (normalizedPath.endsWith('generated')) {
                    return ['file1.txt', 'dir1', 'dir2'];
                }
                if (normalizedPath.endsWith('dir1')) {
                    return ['nested1.txt', 'nestedDir1'];
                }
                if (normalizedPath.endsWith('nestedDir1')) {
                    return ['deepNested.txt'];
                }
                if (normalizedPath.endsWith('dir2')) {
                    return ['nested2.txt'];
                }
                return [];
            });

            mockStatSync.mockImplementation((filePath: string) => ({
                size: 100,
                birthtime: mockDate,
                mtime: mockDate,
                isDirectory: () => !filePath.endsWith('.txt')
            }));

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const listFilesRoute = routes.find(r => r.route.path === '/api/list-files');
            listFilesRoute.route.stack[0].handle(mockReq, mockRes);

            const response = jsonMock.mock.calls[0][0];
            expect(response).toHaveProperty('files');
            expect(response).toHaveProperty('treeView');

            const files = response.files;
            expect(files.length).toBe(3);

            // Verify root level file
            expect(files[0].name).toBe('file1.txt');
            expect(files[0].type).toBe('file');

            // Verify first directory and its nested contents
            const dir1 = files[1];
            expect(dir1.name).toBe('dir1');
            expect(dir1.type).toBe('directory');
            expect(dir1.children).toBeDefined();
            expect(dir1.children?.length).toBe(2);

            // Verify nested directory and its contents
            const nestedDir1 = dir1.children?.find((child: FileNode) => child.name === 'nestedDir1');
            expect(nestedDir1).toBeDefined();
            expect(nestedDir1?.type).toBe('directory');
            expect(nestedDir1?.children).toBeDefined();
            expect(nestedDir1?.children?.length).toBe(1);

            // Verify second directory and its contents
            const dir2 = files[2];
            expect(dir2.name).toBe('dir2');
            expect(dir2.type).toBe('directory');
            expect(dir2.children).toBeDefined();
            expect(dir2.children?.length).toBe(1);
        });

        test('should handle errors gracefully', () => {
            mockExistsSync.mockImplementation(() => {
                throw new Error('Test error');
            });

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const listFilesRoute = routes.find(r => r.route.path === '/api/list-files');
            listFilesRoute.route.stack[0].handle(mockReq, mockRes);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Internal server error',
                details: 'Test error'
            });
        });
    });

    describe('POST /api/show-file', () => {
        test('should return 404 when file does not exist', () => {
            mockExistsSync.mockImplementation(() => false);

            mockReq.body = {
                filename: 'nonexistent.txt',
                projectName: 'test-project'
            };

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'File not found',
                details: expect.any(String)
            });
        });

        test('should return file contents when file exists', () => {
            mockExistsSync.mockImplementation(() => true);
            const fileContent = 'test file content';
            mockReadFileSync.mockImplementation(() => fileContent);

            mockReq.body = {
                filename: 'test.txt',
                projectName: 'test-project'
            };

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                filename: 'test.txt',
                path: expect.any(String),
                content: fileContent,
                size: 100,
                created: mockDate,
                modified: mockDate
            });
        });

        test('should handle nested file paths correctly', () => {
            mockExistsSync.mockImplementation(() => true);
            const fileContent = 'nested file content';
            mockReadFileSync.mockImplementation(() => fileContent);

            mockReq.body = {
                filename: 'nested/dir/test.txt',
                projectName: 'test-project'
            };

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                filename: 'nested/dir/test.txt',
                path: expect.any(String),
                content: fileContent,
                size: 100,
                created: mockDate,
                modified: mockDate
            });
        });

        test('should handle file read errors gracefully', () => {
            mockExistsSync.mockImplementation(() => true);
            mockReadFileSync.mockImplementation(() => {
                throw new Error('Read error');
            });

            mockReq.body = {
                filename: 'error.txt',
                projectName: 'test-project'
            };

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Internal server error',
                details: 'Read error'
            });
        });
    });
});
