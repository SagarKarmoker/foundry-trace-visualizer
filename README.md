# Foundry Trace Visualizer

Generic real-time EVM execution trace visualizer for **any** Foundry tests. Works with all smart contracts on any EVM-compatible network.

## Quick Start

```bash
# 1. Install dependencies
cd trace-visualizer
npm install

# 2. Open TWO separate terminals

# Terminal 1 - Start server
npm run server

# Terminal 2 - Start frontend
npm run dev

# Terminal 3 - Run forge tests (or use separate terminal)
forge test -vvv | npm run pipe
```

## Usage

### Terminal 1 - Start Socket Server

```bash
cd trace-visualizer
npm run server
```

Server runs on http://localhost:3001

### Terminal 2 - Start Frontend

```bash
cd trace-visualizer
npm run dev
```

Opens http://localhost:5173

### Terminal 3 - Run Tests

```bash
cd trace-visualizer
forge test -vvv | npm run pipe
```

## Commands

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start Vite dev server (port 5173)  |
| `npm run server` | Start socket.io server (port 3001) |
| `npm run pipe`   | Pipe forge output to server        |

## Examples

```bash
# Run specific test with visualization
forge test -vvv --match-test testFork_AeroToUni_WithPriceGap | npm run pipe

# Run all fork tests
forge test -vvv --match-path "test/fork/*" | npm run pipe

# Run all tests
forge test -vvv | npm run pipe
```

## Features

- 📊 **Real-time visualization** - Traces appear instantly as tests run
- 🔍 **Call tree** - Expandable/collapsible execution tree
- 🏢 **Contract names** - Auto-detects common tokens (ETH, USDC, DAI, WETH, etc.) and protocols
- 📱 **Function icons** - Visual indicators for different function types
- 📈 **Stats dashboard** - Total calls, gas used, max depth, contracts involved
- 🌐 **Generic** - Works with **any** smart contract on any EVM network

## Requirements

- Node.js 18+
- Foundry (forge)
- npm

## Troubleshooting

**Frontend not opening?**

- Make sure you ran `npm run dev` in a separate terminal

**No trace showing?**

- Make sure you ran `npm run server` in a separate terminal
- Use `-vvv` or higher flag with forge
- Check server terminal for errors

**Connection refused?**

- Ensure both server (port 3001) and dev server (port 5173) are running
- Restart: Ctrl+C and rerun the commands
