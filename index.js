#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import { generateFolderTree } from './utils/generateTree.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cwd = process.cwd();
const pkgPath = path.join(cwd, 'package.json');
const envPath = path.join(cwd, '.env.example');

function readJSON(filePath) {
  return fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : null;
}

function readEnvVariables() {
  if (!fs.existsSync(envPath)) return [];
  return fs
    .readFileSync(envPath, 'utf-8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

function detectTechDescriptions(techStack) {
  const descriptions = {
    React: 'Frontend framework for building UIs',
    Nextjs: 'React framework for SSR and static site generation',
    Vue: 'Progressive frontend framework',
    Express: 'Backend web framework for Node.js',
    Nodejs: 'JavaScript runtime for backend development',
    Flask: 'Python micro web framework',
    Django: 'Python web framework with built-in features',
    Mongoose: 'MongoDB ODM for Node.js',
    Tailwindcss: 'Utility-first CSS framework',
    Typescript: 'Typed superset of JavaScript',
    Vite: 'Frontend build tool and dev server',
    HTML: 'Markup language for web pages',
    CSS: 'Styling language for web pages',
    JavaScript: 'Programming language for web apps',
    Python: 'General-purpose programming language'
  };

  return techStack.map(t => `| ${t} | ${descriptions[t] || 'Used in this project'} |`);
}

function guessTechStack(deps = {}, devDeps = {}) {
  const all = [...Object.keys(deps), ...Object.keys(devDeps)].map(d => d.toLowerCase());
  const stack = new Set();

  if (all.includes('react')) stack.add('React');
  if (all.includes('next')) stack.add('Nextjs');
  if (all.includes('vue')) stack.add('Vue');
  if (all.includes('express')) stack.add('Express');
  if (all.includes('mongoose')) stack.add('Mongoose');
  if (all.includes('flask')) stack.add('Flask');
  if (all.includes('django')) stack.add('Django');
  if (all.includes('tailwindcss')) stack.add('Tailwindcss');
  if (all.includes('typescript')) stack.add('Typescript');
  if (all.includes('vite')) stack.add('Vite');
  if (all.includes('chalk')) stack.add('Nodejs');

  const hasFrontend = fs.existsSync(path.join(cwd, 'index.html'));
  if (hasFrontend) {
    stack.add('HTML');
    if (fs.existsSync(path.join(cwd, 'style.css'))) stack.add('CSS');
    if (fs.existsSync(path.join(cwd, 'script.js'))) stack.add('JavaScript');
  }

  stack.add('JavaScript');

  return Array.from(stack);
}

function detectInstallAndRunCommand(tech) {
  const lowerTech = tech.map(t => t.toLowerCase());
  if (lowerTech.includes('python') || lowerTech.includes('flask') || lowerTech.includes('django')) {
    return {
      install: 'pip install -r requirements.txt',
      run: lowerTech.includes('flask') ? 'flask run' : 'python manage.py runserver'
    };
  }

  if (lowerTech.includes('nextjs')) return { install: 'npm install', run: 'npm run dev' };
  if (lowerTech.includes('vite')) return { install: 'npm install', run: 'npm run dev' };
  if (lowerTech.includes('react')) return { install: 'npm install', run: 'npm start' };
  if (lowerTech.includes('vue')) return { install: 'npm install', run: 'npm run serve' };

  return { install: 'npm install', run: 'npm run dev' };
}

function generateFeatureList({ tech, scripts, envVars, tree }) {
  const features = [];
  const tags = tech.map(t => t.toLowerCase());

  if (tags.includes('react')) features.push('⚛️ Built with React for component-driven UI');
  if (tags.includes('express')) features.push('🚀 Fast and lightweight backend using Express');
  if (tags.includes('nextjs')) features.push('⚡ Server-rendered React app using Next.js');
  if (tags.includes('flask')) features.push('🔥 Python backend powered by Flask');
  if (tags.includes('django')) features.push('🧰 Structured web backend using Django');
  if (tags.includes('vue')) features.push('🔋 Reactive front-end with Vue.js');
  if (tags.includes('tailwindcss')) features.push('🎨 Utility-first styling using Tailwind CSS');
  if (tags.includes('typescript')) features.push('🔐 Type-safe codebase using TypeScript');
  if (tags.includes('html') && tags.includes('css') && tags.includes('javascript')) features.push('🧱 Built using vanilla HTML, CSS & JS');

  if (envVars.length) features.push('🔐 Configurable via environment variables');
  if (scripts.dev) features.push('💻 Dev server available via `npm run dev`');
  if (tree) features.push('📂 Modular project structure');

  return features.length
    ? `## ✨ Features\n\n` + features.map(f => `- ${f}`).join('\n') + '\n\n---\n'
    : '';
}

function buildReadme(pkg, envVars, tree) {
  const tech = guessTechStack(pkg.dependencies, pkg.devDependencies);
  const techDesc = detectTechDescriptions(tech);
  const scripts = pkg.scripts || {};
  const features = generateFeatureList({ tech, scripts, envVars, tree });
  const { install, run } = detectInstallAndRunCommand(tech);

  let readme = `# 📘 ${pkg.name || 'Project Name'}\n\n`;
  readme += `${pkg.description || 'A modern application with clean architecture.'}\n\n---\n\n`;

  readme += features;

  readme += `## 🧱 Tech Stack\n\n| Technology | Description |\n|------------|-------------|\n${techDesc.join('\n')}\n\n---\n\n`;

 readme += `## 🚀 Getting Started

Install dependencies:
\`\`\`bash
${install}
\`\`\`

Run the app:
\`\`\`bash
${run}
\`\`\`

`;

  if (Object.keys(scripts).length > 0) {
    readme += `---\n\n## 🛠️ Scripts\n\n`;
    for (const [key, value] of Object.entries(scripts)) {
      readme += `- \`${key}\`: ${value}\n`;
    }
    readme += '\n';
  }

  if (envVars.length) {
    readme += `---\n\n## ⚙️ Environment Variables\n\nCreate a \`.env\` file with the following:\n\n`;
    readme += '```env\n' + envVars.join('\n') + '\n```\n\n';
  }

  if (tree) {
    readme += `---\n\n## 📂 Folder Structure\n\n`;
    readme += '```text\n' + tree + '\n```\n\n';
  }

  readme += `---\n\n## 📄 License\n\n${pkg.license || 'MIT'}\n`;
  return readme;
}

function generateReadme() {
  const pkg = readJSON(pkgPath);
  if (!pkg) {
    console.log(chalk.red('❌ No package.json found in this directory.'));
    return;
  }

  const envVars = readEnvVariables();
  const tree = generateFolderTree('src', 2);

  const content = buildReadme(pkg, envVars, tree);
  fs.writeFileSync('README.md', content, 'utf-8');

  console.log(chalk.greenBright('✅ README.md generated successfully!'));
}

generateReadme();