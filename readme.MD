# Welcome to Skillama project

Skillama is a server application that enhances LLM chatbots with custom code-generated skills. It runs through a tunneler for AI chatbots and is designed to be mobile-friendly.

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