# Welcome to Skillama project

Skillama is a server application that enhances LLM chatbots with custom code-generated skills. It runs through a tunneler for AI chatbots and is designed to be mobile-friendly.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
  - [Test Structure](#test-structure)
  - [Environment Setup for Tests](#environment-setup-for-tests)
- [Dependencies](#dependencies)
  - [Main Dependencies](#main-dependencies)
  - [Development Dependencies](#development-dependencies)

## Features

- AI Code Generation using Anthropic's Claude API
- Local tunnel support for remote access
- Express.js server implementation
- Cross-platform support (Ubuntu and Android via Termux)
- Web-based frontend with JSON editor and OpenAPI documentation
- Monorepo structure with separate frontend and backend packages

## Prerequisites

- Node.js >= 18.0.0
- Bun >= 1.0.0
- Anthropic API key

## Project Structure

- `/back` - Backend server implementation
  - `/src` - Source code
  - `/tests` - Test files
  - `/docs` - OpenAPI documentation
- `/front` - Frontend application
  - `/src` - Source code
    - `/pages` - Page components
    - `/components` - Reusable components
    - `/services` - Utility services
  - `/public` - Static assets
- `generated/` - Directory for AI-generated code output

## Installation

[Previous installation instructions remain the same]

## Configuration

1. Create a .env.local file in the root directory with the following variables:
  - ANTHROPIC_API_KEY=your_api_key_here 
  - TUNNELER_NAME=your-tunnel-name 
  - OUTPUT_DIR=/path/to/output/directory 
  - DEV_MODE=true/false


2. Ensure the OUTPUT_DIR exists and is writable

## Usage

From root skillama directory:

**Start backend in development mode**:
```bash
bun back:dev
```

**Start frontend development server:**

```bash
bun front:watch
```

**Build for production:**

```bash
bun back:transpile  # Build backend
bun front:build    # Build frontend
```

**Start production server:**

```bash
bun start         # Using Bun
# or
bun node:start    # Using Node.js
```

## Testing

The project uses Bun's built-in test runner with the following commands:

```bash
bun test              # Run all tests once
bun test:watch        # Run tests in watch mode
```

**Test Structure**

- /back/tests contains all test files:
  - ai.test.ts - Tests for AI service and Claude API integration
  - traverseFiles.test.ts - Tests for file system operations
  - setup.ts - Test environment configuration
  - _env.ts - Environment loading utilities

**Environment Setup for Tests**

Tests automatically load environment variables from:

1. **.env** in the root directory (base configuration)
2. **.env.local** in the root directory (overrides for local development)

## Dependencies
### Main Dependencies
- @anthropic-ai/sdk: ^0.18.0 - Claude AI API integration
- express: ^4.18.3 - Web server framework
- cors: ^2.8.5 - Cross-origin resource sharing
- dotenv: ^16.4.5 - Environment configuration
- localtunnel: ^2.0.2 - Local tunnel for remote access
- swagger-ui-express: ^5.0.1 - API documentation
- uniqid: ^5.4.0 - Unique ID generation
### Development Dependencies
- TypeScript and type definitions (@types/*)
- bun-types: ^1.1.38
- supertest: ^6.3.4 - HTTP testing
- nodemon: ^3.1.0 - Development server
- tsc-watch: ^6.0.0 - TypeScript compilation watcher