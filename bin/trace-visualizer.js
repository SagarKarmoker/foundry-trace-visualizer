#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function spawnTool(command) {
  return spawn(command, {
    stdio: 'inherit',
    cwd: rootDir,
    env: process.env,
    shell: true,
  });
}

function printHelp() {
  console.log(`
Foundry Trace Visualizer CLI

Usage:
  trace-visualizer <command>
  tviz <command>

Commands:
  server       Start Socket.IO trace server (port 3001)
  pipe         Read forge output from stdin and send traces to server
  dev          Start frontend (Vite dev server)
  visualize    Start server + frontend together
  help         Show this help

Examples:
  trace-visualizer server
  forge test -vvv | trace-visualizer pipe
  trace-visualizer visualize
`);
}

function runNpmScript(scriptName) {
  const child = spawnTool(`npm run ${scriptName}`);

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });
}

function runVisualize() {
  runNpmScript('visualize');
}

const command = process.argv[2] || 'help';

switch (command) {
  case 'server':
    runNpmScript('server');
    break;
  case 'pipe':
    runNpmScript('pipe');
    break;
  case 'dev':
    runNpmScript('dev');
    break;
  case 'visualize':
    runVisualize();
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    printHelp();
    process.exit(1);
}
