import { expect, test, describe, beforeEach, mock } from "bun:test";
import express from 'express';
import fs from 'fs';
import path from 'path';
import { traverseFilesSkill } from '../.old.src/skills/traverseFiles';

const MOCK_CWD = '/mnt/f/AI/CODE/skillama/back';
process.cwd = () => MOCK_CWD;

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
const mockResolve = mock<(...args: string[]) => string>((...args: string[]) => path.join(MOCK_CWD, ...args));
const mockJoin = mock<(...args: string[]) => string>((...args: string[]) => args.join('/'));
const mockNormalize = mock<(p: string) => string>((p: string) => p);

// Replace the actual fs and path methods with our mocks
(fs as any).existsSync = mockExistsSync;
(fs as any).readdirSync = mockReaddirSync;
(fs as any).statSync = mockStatSync;
(fs as any).readFileSync = mockReadFileSync;
(path as any).resolve = mockResolve;
(path as any).join = mockJoin;
(path as any).normalize = mockNormalize;

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
        mockNormalize.mockReset();
        
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
        mockResolve.mockImplementation((...args) => path.join(MOCK_CWD, ...args));
        mockJoin.mockImplementation((...args) => args.join('/'));
        mockNormalize.mockImplementation((p) => p);
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
            const outputDir = path.join(MOCK_CWD, 'generated');
            
            mockExistsSync.mockImplementation(() => true);
            
            mockReaddirSync.mockImplementation((dirPath: string) => {
                if (dirPath === outputDir) {
                    return ['file1.txt'];
                }
                return [];
            });
            
            mockStatSync.mockImplementation((filePath: string) => ({
                size: 100,
                birthtime: mockDate,
                mtime: mockDate,
                isDirectory: () => false
            }));

            traverseFilesSkill(app);

            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const listFilesRoute = routes.find(r => r.route.path === '/api/list-files');
            listFilesRoute.route.stack[0].handle(mockReq, mockRes);

            const expectedFiles = [
                {
                    name: 'file1.txt',
                    path: path.join(outputDir, 'file1.txt'),
                    type: 'file',
                    size: 100,
                    created: mockDate,
                    modified: mockDate
                }
            ];

            expect(jsonMock).toHaveBeenCalledWith({
                files: expectedFiles,
                treeView: '└── file1.txt\n'
            });
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
        test('should return 404 when project directory does not exist', () => {
            mockExistsSync.mockImplementation(() => false);
        
            mockReq.body = {
                filename: 'test.txt',
                projectName: 'nonexistent-project'
            };
        
            traverseFilesSkill(app);
        
            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);
        
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Project not found',
                details: 'Project directory nonexistent-project does not exist'
            });
        });
        
        test('should return 400 when required parameters are missing', () => {
            mockReq.body = {
                filename: 'test.txt'
                // missing projectName
            };
        
            traverseFilesSkill(app);
        
            const routes = (app._router.stack as any[]).filter(layer => layer.route);
            const showFileRoute = routes.find(r => r.route.path === '/api/show-file');
            showFileRoute.route.stack[0].handle(mockReq, mockRes);
        
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                error: 'Bad Request',
                details: 'Both filename and projectName are required'
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
