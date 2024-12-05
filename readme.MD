# Welcome to Skillama project

Skillama is a server application that enhances LLM chatbots with custom code-generated skills. It runs through a tunneler for AI chatbots and is designed to be mobile-friendly.

## Features

- AI Code Generation using Anthropic's Claude API
- Local tunnel support for remote access
- Express.js server implementation
- Cross-platform support (Ubuntu and Android via Termux)

## Prerequisites

- Node.js >= 18.0.0
- Bun (preferred) or Deno
- Anthropic API key

## Installation

### Ubuntu Installation

1. Install Node.js & BUN:
```bash
apt install nodejs
curl -fsSL https://bun.sh/install | bash
```

2. Install project dependencies:
```bash
npm install
```

or

```bash
bun install
```

### Android/Termux Installation

Choose one of the following methods for installing dev ubuntu on proot-distro (linux distro android emulator):

1. Using CURL:
```bash
curl -s https://raw.githubusercontent.com/papablack/skillama/refs/heads/master/bin/termux_install.sh | bash
```
or

2. Using WGET:
```bash
wget -qO- https://raw.githubusercontent.com/papablack/skillama/refs/heads/master/bin/termux_install.sh | bash
```

**In your Termux instance **

Type in 

```bash
ubuntu-run git clone git@github.com:papablack/skillama.git
```

The installer will create aliases in your Termux instance:

- ubuntu: opens the dev ubuntu
- ubuntu-run command: runs a command in the dev ubuntu

The **Skillama** code will be in */home/termux/skillama*

## Configuration

1. Create a .env.local file in the root directory with the following variables:

*You can use **.env** file for reference*

```
ANTHROPIC_API_KEY=your_api_key_here
TUNNELER_NAME=your-tunnel-name
OUTPUT_DIR=/path/to/output/directory
```

2. Ensure the OUTPUT_DIR exists and is writable

## Usage

From root skillama directory run:

**Development mode**:
```bash
bun dev
```

**Production mode**:
```bash
bun start
```

The server will start on port 3000 (default) and automatically create a tunnel with your specified subdomain.

## Project Structure

- `/inc` - Core functionality modules
  - `ai.ts` - Anthropic Claude integration
  - `srv.ts` - Express server setup
  - `tunnel.ts` - Local tunnel configuration
- `index.ts` - Main application entry point
- `generated/` - Directory for AI-generated code output

## Technical Details

- Uses Claude 3 Sonnet model for AI code generation
- Maximum token limit: 4096
- Temperature setting: 0.8
- Implements automatic tunnel creation with custom subdomain support
- Express server with CORS support

## Notes
- Your example *.env.local* is in *.env*
- SKILLAMA_PORT env will set port for server.
- Keep your ANTHROPIC_API_KEY secure and never commit it to version control
- The generated code is saved in the directory specified by OUTPUT_DIR
- The tunnel URL will be displayed in the console when the server starts