#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function setupProject(projectName) {
  try {
    // 1. Create Vite Project
    console.log('Creating Vite project...');
    execSync(`npm create vite@latest ${projectName} -- --template react`);
    process.chdir(projectName);

    // 2. Install Dependencies
    console.log('Installing dependencies...');
    execSync('npm install react-router-dom@latest lucide-react@latest');
    execSync('npm install -D tailwindcss postcss autoprefixer wrangler');
    execSync('npx tailwindcss init -p');

    // 3. Set up Tailwind Config
    const tailwindConfig = `module.exports = {
      content: ["./src/**/*.{js,jsx,ts,tsx}"],
      theme: { extend: {} },
      plugins: [],
    };`;
    fs.writeFileSync('tailwind.config.js', tailwindConfig);

    // 4. Create Worker Directories
    fs.mkdirSync(path.join('src', 'worker', 'chat'), { recursive: true });
    fs.mkdirSync(path.join('src', 'worker', 'contact'), { recursive: true });

    // 5. Create Worker Files
    const chatWorkerConfig = `name = "${projectName}-chat-worker"
main = "index.js"
compatibility_date = "2024-01-01"

[env.production]
workers_dev = false

[observability.logs]
enabled = true

[[d1_databases]]
binding = "DB"
database_name = "chat-history"`;

    fs.writeFileSync(
      path.join('src', 'worker', 'chat', 'wrangler.toml'),
      chatWorkerConfig
    );

    console.log('Project setup completed successfully!');
  } catch (error) {
    console.error('Error setting up project:', error);
    process.exit(1);
  }
}

// Run the setup
const projectName = process.argv[2];
if (!projectName) {
  console.error('Please provide a project name');
  process.exit(1);
}

setupProject(projectName);