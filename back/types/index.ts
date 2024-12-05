import { Request, Response, NextFunction } from 'express';

export interface TunnelOptions {
  port: number;
  subdomain: string;
  skip_tunnel_warning?: boolean
}

export interface TunnelInstance {
  url: string;
  on(event: 'close' | 'error', callback: (err?: Error) => void): void;
}

export interface FileStats {
  name: string;
  path: string;
  size: number;
  created: Date;
  modified: Date;
}

export interface GenerateCodeRequest {
  prompt: string;
  filename: string;
}

export interface ShowFileResponse {
  filename: string;
  path: string;
  content: string;
  size: number;
  created: Date;
  modified: Date;
}

// Add these new interfaces for GitHub functionality
export interface GitHubCreateRepoResponse {
  html_url: string;
  clone_url: string;
  ssh_url: string;
  name: string;
}

export interface GitSyncRequest {
  message: string;
  projectName: string;
  uuid: string;
  createRepo?: boolean;
  isPrivate?: boolean;
  description?: string;
}