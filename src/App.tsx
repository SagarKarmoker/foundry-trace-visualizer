import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import './App.css';
import TraceTree from './components/TraceTree';
import TraceStats from './components/TraceStats';
import type { TraceNode } from './utils/traceParser';

const SERVER_URL = 'http://localhost:3001';

function App() {
  const [traceData, setTraceData] = useState<TraceNode[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(true);

  useEffect(() => {
    const socket: Socket = io(SERVER_URL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setConnected(true);
      setWaiting(false);
      console.log('Connected to trace server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('trace', (data: TraceNode[]) => {
      console.log('Received trace with', data.length, 'nodes');
      setTraceData(data);
    });

    fetch(`${SERVER_URL}/trace`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setTraceData(data);
        }
        setWaiting(false);
      })
      .catch(() => setWaiting(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>🔍 Foundry Trace Visualizer</h1>
        <p>Visualize EVM execution traces from Forge tests</p>
        <div className="connection-status">
          <span
            className={`status-dot ${connected ? 'connected' : 'waiting'}`}
          ></span>
          <span className="status-text">
            {connected
              ? 'Connected to server'
              : waiting
                ? 'Waiting for forge output...'
                : 'Not connected'}
          </span>
        </div>
      </header>

      <div className="instructions">
        <h3>🚀 Usage</h3>
        <pre className="command">
          {`# Terminal 1 - Start server:
npm run server

# Terminal 2 - Run forge and pipe:
forge test -vvv | npx tsx src/pipe.ts`}
        </pre>
      </div>

      {traceData && traceData.length > 0 && (
        <>
          <TraceStats nodes={traceData} />
          <TraceTree nodes={traceData} />
        </>
      )}

      {!traceData && connected && (
        <div className="empty-state">
          <div className="icon">⏳</div>
          <h2>Waiting for Trace Data</h2>
          <p>Run forge test with -vvv flag and pipe to the visualizer</p>
          <pre className="example">
            forge test -vvv --match-test testFork_AeroToUni_WithPriceGap | npx
            tsx src/pipe.ts
          </pre>
        </div>
      )}

      {!traceData && !connected && !waiting && (
        <div className="empty-state error-state">
          <div className="icon">⚠️</div>
          <h2>Server Not Connected</h2>
          <p>Start the server first with: npm run server</p>
        </div>
      )}
    </div>
  );
}

export default App;
