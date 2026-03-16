#!/usr/bin/env node
import { io } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

let buffer = '';
let traceLines: string[] = [];
let inTrace = false;
let testCount = 0;

socket.on('connect', () => {
  console.log('📡 Connected to trace server');
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

function detectTraceLine(line: string): boolean {
  return (
    line.includes('Traces:') ||
    line.startsWith('[ ') ||
    line.includes('├─') ||
    line.includes('└─') ||
    line.match(/^\[\d+\]/)?.[0] === '['
  );
}

function isTestResult(line: string): boolean {
  return (
    line.includes('Suite result:') ||
    line.includes('passed') ||
    line.includes('failed') ||
    (line.includes('Ran ') && line.includes('test'))
  );
}

function sendTrace() {
  if (traceLines.length > 0) {
    const traceText = traceLines.join('\n');
    if (traceText.includes('├─') || traceText.includes('└─')) {
      testCount++;
      console.log(
        `📤 Sending trace #${testCount} (${traceLines.length} lines)`,
      );
      socket.emit('forge-output', traceText);
    }
    traceLines = [];
    inTrace = false;
  }
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk: string) => {
  buffer += chunk;

  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (detectTraceLine(line)) {
      inTrace = true;
    }

    if (inTrace) {
      traceLines.push(line);

      if (isTestResult(line)) {
        sendTrace();
      }
    }
  }

  if (buffer.includes('Traces:') || buffer.includes('├─')) {
    const remainingLines = buffer.split('\n').filter((l) => detectTraceLine(l));
    if (remainingLines.length > 0) {
      traceLines.push(...remainingLines);
      sendTrace();
    }
  }
});

process.stdin.on('end', () => {
  sendTrace();
  setTimeout(() => process.exit(0), 1000);
});

process.on('SIGINT', () => {
  sendTrace();
  socket.disconnect();
  process.exit(0);
});

console.log('🔗 Waiting for forge output...');
console.log('Usage: forge test -vvv --match-test TestName | npm run pipe');
