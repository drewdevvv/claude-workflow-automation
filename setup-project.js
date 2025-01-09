#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FRAMEWORKS = {
  'next': {
    name: 'Next.js',
    command: 'npx create-next-app@latest',
    buildCommand: 'npm run build',
    defaultPort: 3000
  },
  'remix': {
    name: 'Remix',
    command: 'npx create-remix@latest',
    buildCommand: 'npm run build',
    defaultPort: 3000
  },
  'vite-react': {
    name: 'Vite + React',
    command: 'npm create vite@latest -- --template react',
    buildCommand: 'npm run build',
    defaultPort: 5173
  },
  'nuxt': {
    name: 'Nuxt',
    command: 'npx nuxi init',
    buildCommand: 'npm run build',
    defaultPort: 3000
  },
  'sveltekit': {
    name: 'SvelteKit',
    command: 'npm create svelte@latest',
    buildCommand: 'npm run build',
    defaultPort: 5173
  },
  'astro': {
    name: 'Astro',
    command: 'npm create astro@latest',
    buildCommand: 'npm run build',
    defaultPort: 3000
  }
};

async function promptFramework() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\nAvailable frameworks:');
  Object.entries(FRAMEWORKS).forEach(([key, framework], index) => {
    console.log(`${index + 1}. ${framework.name}`);
  });

  return new Promise((resolve) => {
    rl.question('\nSelect a framework (enter number): ', (answer) => {
      rl.close();
      const frameworks = Object.keys(FRAMEWORKS);
      const selection = frameworks[parseInt(answer) - 1];
      resolve(selection || 'vite-react'); // Default to Vite + React if invalid
    });
  });
}

async function setupProject(projectName) {
  try {
    // 1. Select Framework
    const framework = await promptFramework();
    const selectedFramework = FRAMEWORKS[framework];
    console.log(`\nSetting up ${selectedFramework.name} project...`);

    // 2. Create Project
    execSync(`${selectedFramework.command} ${projectName}`, { stdio: 'inherit' });
    process.chdir(projectName);

    // 3. Install Common Dependencies
    console.log('\nInstalling common dependencies...');
    execSync('npm install @cloudflare/workers-types wrangler lucide-react', { stdio: 'inherit' });

    // 4. Create Worker Directories
    fs.mkdirSync(path.join('src', 'worker', 'chat'), { recursive: true });
    fs.mkdirSync(path.join('src', 'worker', 'contact'), { recursive: true });

    // 5. Create Cloudflare Configuration
    const wranglerConfig = `name = "${projectName}-chat-worker"
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
      wranglerConfig
    );

    // 6. Create Pages Configuration
    const pagesConfig = {
      name: projectName,
      framework: selectedFramework.name.toLowerCase(),
      buildCommand: selectedFramework.buildCommand,
      devCommand: 'npm run dev',
      outputDirectory: framework === 'next' ? '.next' : 'dist'
    };

    fs.writeFileSync('.cloudflare/pages.json', JSON.stringify(pagesConfig, null, 2));

    console.log('\nProject setup completed successfully!');
    console.log(`\nNext steps:
1. cd ${projectName}
2. npm install
3. npm run dev (Development server will start on port ${selectedFramework.defaultPort})
4. Deploy to Cloudflare Pages using 'npx wrangler pages deploy .'`);

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