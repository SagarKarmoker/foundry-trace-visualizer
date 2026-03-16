# Foundry Trace Visualizer

Generic real-time EVM execution trace visualizer for **any** Foundry tests. Works with all smart contracts on any EVM-compatible network.

## Quick Start

```bash
# 1. Install dependencies
cd trace-visualizer
npm install

# 2. Open THREE separate terminals

# Terminal 1 - Start server
npm run server

# Terminal 2 - Start frontend
npm run dev

# Terminal 3 - Run forge tests (or use separate terminal)
forge test -vvv | npm run pipe
```

## Global Install (Easy Mode)

Install once and use from any project:

```bash
# from this repository
npm install -g .
```

Now you can run:

```bash
trace-visualizer help
trace-visualizer visualize
```

Short alias also works:

```bash
tviz visualize
```

From your smart-contract project:

```bash
forge test -vvvv | tviz pipe
```

Keep global command up to date after pulling new changes:

```bash
npm uninstall -g trace-visualizer
npm install -g .
```

If your shell does not pick up global bins immediately, restart terminal or run:

```bash
hash -r
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
| `npm run visualize` | Start frontend + server together |

Global CLI commands:

| Command                     | Description                               |
| --------------------------- | ----------------------------------------- |
| `trace-visualizer server`   | Start socket.io server (port 3001)        |
| `trace-visualizer dev`      | Start frontend (Vite on port 5173)        |
| `trace-visualizer pipe`     | Read forge output from stdin and send it  |
| `trace-visualizer visualize`| Start server + frontend together          |
| `tviz ...`                  | Alias for `trace-visualizer ...`          |

Recommended global flow:

```bash
# terminal 1
tviz visualize

# terminal 2 (in your smart contract repo)
forge test -vvvv | tviz pipe
```

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

**`tviz visualize` fails with `ERR_PACKAGE_PATH_NOT_EXPORTED`?**

- Your global install is likely stale
- Reinstall globally:

```bash
npm uninstall -g trace-visualizer
npm install -g .
```

**`npm: exec: node: not found` in WSL?**

- You are running a Windows npm shim from WSL without a WSL Node install
- Install Node inside WSL (or run commands from PowerShell/Git Bash)
- Verify in WSL:

```bash
which node && node -v
which npm && npm -v
```
