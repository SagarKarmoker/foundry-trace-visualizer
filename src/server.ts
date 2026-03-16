#!/usr/bin/env node
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { parseTrace } from './utils/traceParser.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

let latestTrace: any = null;

io.on('connection', (socket) => {
  console.log('Client connected');

  if (latestTrace) {
    socket.emit('trace', latestTrace);
  }

  socket.on('forge-output', (traceText: string) => {
    try {
      const parsed = parseTrace(traceText);
      if (parsed.length > 0) {
        latestTrace = parsed;
        console.log(
          `📊 Parsed ${parsed.length} call nodes, broadcasting to clients...`,
        );
        io.emit('trace', parsed);
      }
    } catch (e) {
      console.log('Error parsing trace:', e);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

process.stdin.setEncoding('utf8');

let buffer = '';
let traceStart = false;
let traceLines: string[] = [];

process.stdin.on('data', (chunk: string) => {
  buffer += chunk;

  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (
      line.includes('Traces:') ||
      line.includes('[0]') ||
      line.includes('├─') ||
      line.includes('│')
    ) {
      traceStart = true;
    }

    if (traceStart) {
      traceLines.push(line);

      if (
        line.includes('Suite result:') ||
        line.includes('passed') ||
        line.includes('failed')
      ) {
        const traceText = traceLines.join('\n');
        try {
          const parsed = parseTrace(traceText);
          if (parsed.length > 0) {
            latestTrace = parsed;
            console.log(
              `\n📊 Parsed ${parsed.length} call nodes, broadcasting to clients...`,
            );
            io.emit('trace', parsed);
          }
        } catch (e) {
          console.log('Waiting for trace data...');
        }
        traceStart = false;
        traceLines = [];
      }
    }
  }
});

process.stdin.on('end', () => {
  if (buffer.trim()) {
    traceLines.push(buffer);
  }
});

app.get('/health', (_, res) => {
  res.json({ status: 'ok', hasTrace: !!latestTrace });
});

app.get('/trace', (_, res) => {
  res.json(latestTrace || []);
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       🔍 Foundry Trace Visualizer Server                  ║
╠══════════════════════════════════════════════════════════╣
║  Server:  http://localhost:${PORT}                         ║
║                                                          ║
║  Usage:                                                  ║
║    forge test -vvv | npx ts-node start-server.ts        ║
║                                                          ║
║  Or run separately:                                      ║
║    1. Start server: npx ts-node start-server.ts         ║
║    2. Open: http://localhost:5173                        ║
║    3. Run: forge test -vvv | npx ts-node pipe.ts        ║
╚══════════════════════════════════════════════════════════╝
  `);
});
