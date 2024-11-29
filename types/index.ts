import { Request, Response, NextFunction } from 'express';

export interface TunnelOptions {
  port: number;
  subdomain?: string;
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