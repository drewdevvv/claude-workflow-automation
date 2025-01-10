#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectName = process.argv[2];
if (!projectName) {
  console.error('Please specify a project name');
  process.exit(1);
}

// Create project directory and initialize
console.log(`Creating new project: ${projectName}`);
execSync(`mkdir ${projectName}`);
process.chdir(projectName);

// Initialize git
execSync('git init');

// Create package.json
const packageJson = {
  name: projectName,
  version: '1.0.0',
  type: 'module',
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
    deploy: 'wrangler pages publish dist'
  },
  dependencies: {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
    '@anthropic-ai/sdk': '^0.10.0',
    '@cloudflare/workers-types': '^4.20240108.0',
    'lucide-react': '^0.263.1'
  },
  devDependencies: {
    '@vitejs/plugin-react': '^4.2.0',
    'autoprefixer': '^10.4.16',
    'postcss': '^8.4.31',
    'tailwindcss': '^3.3.5',
    'vite': '^5.0.0',
    'wrangler': '^3.22.1'
  }
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Create project structure
const dirs = [
  'src',
  'src/components',
  'src/pages',
  'public',
  'functions'
];

dirs.forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Initialize npm and install dependencies
console.log('Installing dependencies...');
execSync('npm install');

// Create configuration files
const configFiles = {
  'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`,
  
  'tailwind.config.js': `module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};`,
  
  'postcss.config.js': `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`,
  
  'wrangler.toml': `[env.production]
name = "${projectName}"

[[d1_databases]]
binding = "DB"
database_name = "${projectName}_db"
database_id = ""

[site]
bucket = "./dist"`,
  
  '.env.example': `ANTHROPIC_API_KEY=your_api_key
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token`
};

Object.entries(configFiles).forEach(([filename, content]) => {
  fs.writeFileSync(filename, content);
});

console.log('Project setup complete! Next steps:');
console.log('1. cd', projectName);
console.log('2. Copy .env.example to .env and add your API keys');
console.log('3. npm run dev to start development server');
