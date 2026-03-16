export interface TraceNode {
  id: string;
  type:
    | 'call'
    | 'create'
    | 'delegatecall'
    | 'staticcall'
    | 'selfdestruct'
    | 'log';
  depth: number;
  gas: number;
  gasUsed: number;
  value?: string;
  from: string;
  to: string;
  input?: string;
  output?: string;
  error?: string;
  functionName?: string;
  contractName?: string;
  children: TraceNode[];
}

export interface TraceStats {
  totalCalls: number;
  totalGasUsed: number;
  totalValue: number;
  contracts: Map<string, string>;
  externalCalls: number;
  internalCalls: number;
  reverts: number;
  maxDepth: number;
}

const COMMON_TOKENS: Record<string, string> = {
  '0x0000000000000000000000000000000000000000': 'ETH',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC',
  '0x4200000000000000000000000000000000000006': 'WETH',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH',
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'AAVE',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK',
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': 'MATIC',
  '0x940181a94a35a4569e4529a3cdfb74e38fd98631': 'AERO',
};

const COMMON_PROTOCOLS: Record<string, string> = {
  '0xa238dd80c259a72e81d7e4664a9801593f98d1c5': 'AavePool',
  '0x8ae720a71622e824f639dc1f08a2d2b6f8b3aba5': 'AavePool',
  '0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43': 'AerodromeRouter',
  '0x2626664c2603336e57b271c5c0b26f421741e481': 'UniswapV3Router',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'UniswapV3Router',
  '0x33128a8fc17869897dce68ed026d694621f6fdffd': 'UniswapFactory',
  '0x420dd381b31aef6683db6b902084cb0ffece40da': 'AerodromeFactory',
  '0x5c4c5c8506bbf24d3aa461ba4d9c5b30b5e3a6f3': 'PoolFactory',
};

const KNOWN_FUNCTIONS: Record<string, string> = {
  balanceOf: '💰',
  transfer: '↗️',
  transferFrom: '↔️',
  approve: '✅',
  swapExactTokensForTokens: '🔄',
  swapTokensForExactTokens: '🔄',
  exactInputSingle: '🔄',
  exactInput: '🔄',
  flashLoanSimple: '⚡',
  flashLoan: '⚡',
  executeOperation: '🎯',
  executeArbitrage: '🎰',
  getAmountOut: '📊',
  getAmountIn: '📊',
  quote: '📊',
  getFee: '💳',
  swap: '💱',
  mint: '🧪',
  burn: '🔥',
  deposit: '📥',
  withdraw: '📤',
  totalSupply: '📈',
  allowance: '🔑',
  setApprovalForAll: '🔐',
  safeTransferFrom: '🔒',
  owner: '👤',
  nonces: '🔢',
  permit: '📝',
  emit: '📢',
};

function getContractName(addr: string): string | undefined {
  if (!addr || addr === '0x0' || addr === '0x') return undefined;
  const lower = addr.toLowerCase();
  return COMMON_TOKENS[lower] || COMMON_PROTOCOLS[lower];
}

export function formatAddress(addr: string): string {
  if (!addr || addr === '0x' || addr === '0x0') return 'EOA';
  const name = getContractName(addr);
  if (name) return name;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function findContractAddress(line: string): string {
  const addrMatch = line.match(/(0x[a-fA-F0-9]{40})::/);
  if (addrMatch) return addrMatch[1];

  const fromMatch = line.match(/from:\s*(0x[a-fA-F0-9]{40})/i);
  if (fromMatch) return fromMatch[1];

  const atMatch = line.match(/:(0x[a-fA-F0-9]{40}),?\s/);
  if (atMatch) return atMatch[1];

  return '0x0';
}

function extractFunctionName(line: string): string | undefined {
  const funcMatch = line.match(/::([^(]+)\(/);
  if (funcMatch) return funcMatch[1].trim();

  const emitMatch = line.match(/emit\s+(\w+)/);
  if (emitMatch) return `emit ${emitMatch[1]}`;

  return undefined;
}

export function getFunctionIcon(funcName: string | undefined): string {
  if (!funcName) return '❓';
  const lower = funcName.toLowerCase();
  for (const [key, icon] of Object.entries(KNOWN_FUNCTIONS)) {
    if (lower.includes(key.toLowerCase())) {
      return icon;
    }
  }
  return '📞';
}

function calculateDepth(line: string): number {
  return (line.match(/│/g) || []).length;
}

function parseGas(line: string): number {
  const match = line.match(/\[(\d+)\]/);
  return match ? parseInt(match[1]) : 0;
}

function buildTree(lines: string[]): TraceNode[] {
  const roots: TraceNode[] = [];
  const stack: TraceNode[] = [];

  for (const line of lines) {
    if (!line.includes('├─') && !line.includes('└─')) continue;

    const depth = calculateDepth(line);
    const gas = parseGas(line);
    const from = findContractAddress(line);
    const functionName = extractFunctionName(line);
    const contractName =
      getContractName(from) || getContractName(findContractAddress(line));
    const isRevert = line.includes('← [Revert]') || line.includes('Revert');
    const isStaticcall = line.includes('[staticcall]');
    const isDelegatecall = line.includes('[delegatecall]');
    const isCreate = line.includes('[create]');

    let nodeType: TraceNode['type'] = 'call';
    if (isStaticcall) nodeType = 'staticcall';
    else if (isDelegatecall) nodeType = 'delegatecall';
    else if (isCreate) nodeType = 'create';

    const node: TraceNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: nodeType,
      depth,
      gas,
      gasUsed: 0,
      from,
      to: from,
      functionName: functionName || 'unknown',
      contractName,
      children: [],
    };

    if (isRevert && !line.includes('emit')) {
      node.error = 'Revert';
    }

    while (stack.length > 0 && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    if (depth > 0 || line.includes('::')) {
      stack.push(node);
    }
  }

  return roots;
}

export function parseTrace(traceText: string): TraceNode[] {
  const lines = traceText.split('\n');

  let traceStart = false;
  const traceLines: string[] = [];

  for (const line of lines) {
    if (line.includes('Traces:')) {
      traceStart = true;
      continue;
    }

    if (traceStart) {
      if (
        line.trim() === '' ||
        line.includes('Suite result') ||
        line.includes('Ran ')
      ) {
        break;
      }
      if (line.includes('├─') || line.includes('└─')) {
        traceLines.push(line);
      }
    }
  }

  if (traceLines.length === 0) {
    for (const line of lines) {
      if (line.includes('├─') || line.includes('└─')) {
        traceLines.push(line);
      }
    }
  }

  return buildTree(traceLines);
}

export function calculateStats(nodes: TraceNode[]): TraceStats {
  const stats: TraceStats = {
    totalCalls: 0,
    totalGasUsed: 0,
    totalValue: 0,
    contracts: new Map(),
    externalCalls: 0,
    internalCalls: 0,
    reverts: 0,
    maxDepth: 0,
  };

  function traverse(node: TraceNode, depth: number) {
    stats.totalCalls++;
    stats.totalGasUsed += node.gasUsed;
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    if (node.contractName) {
      stats.contracts.set(node.to, node.contractName);
    } else if (node.to && node.to !== '0x0') {
      const name = getContractName(node.to);
      if (name) {
        stats.contracts.set(node.to, name);
      } else {
        stats.contracts.set(
          node.to,
          `${node.to.slice(0, 6)}...${node.to.slice(-4)}`,
        );
      }
    }

    if (node.error) {
      stats.reverts++;
    }

    if (node.depth === 0) {
      stats.externalCalls++;
    } else {
      stats.internalCalls++;
    }

    node.children.forEach((child) => traverse(child, depth + 1));
  }

  nodes.forEach((node) => traverse(node, 0));
  return stats;
}
