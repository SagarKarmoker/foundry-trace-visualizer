import { useState } from 'react';
import type { TraceNode } from '../utils/traceParser';
import { getFunctionIcon, formatAddress } from '../utils/traceParser';

interface Props {
  nodes: TraceNode[];
}

function formatGas(gas: number): string {
  if (gas >= 1000000) return `${(gas / 1000000).toFixed(2)}M`;
  if (gas >= 1000) return `${(gas / 1000).toFixed(1)}K`;
  return gas.toString();
}

interface TreeNodeProps {
  node: TraceNode;
  depth: number;
}

function TreeNode({ node, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;
  const isError = node.error === 'Revert';
  const funcIcon = getFunctionIcon(node.functionName);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call':
        return '#22c55e';
      case 'delegatecall':
        return '#f97316';
      case 'staticcall':
        return '#3b82f6';
      case 'create':
        return '#ec4899';
      default:
        return '#64748b';
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'call':
        return 'rgba(34, 197, 94, 0.15)';
      case 'delegatecall':
        return 'rgba(249, 115, 22, 0.15)';
      case 'staticcall':
        return 'rgba(59, 130, 246, 0.15)';
      default:
        return 'rgba(100, 116, 139, 0.15)';
    }
  };

  return (
    <div className="tree-node" style={{ marginLeft: depth * 20 }}>
      <div
        className={`node-row ${isError ? 'error' : ''}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
        style={{ backgroundColor: getTypeBg(node.type) }}
      >
        {hasChildren ? (
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        ) : (
          <span className="expand-placeholder">│</span>
        )}

        <span
          className="node-type"
          style={{
            backgroundColor: getTypeColor(node.type),
            color: '#fff',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 600,
          }}
        >
          {node.type.toUpperCase()}
        </span>

        <span className="node-icon">{funcIcon}</span>

        <span
          className="node-function"
          style={{ color: '#c084fc', fontWeight: 600 }}
        >
          {node.functionName}
        </span>

        <span className="node-contract" style={{ color: '#fbbf24' }}>
          {node.contractName || formatAddress(node.to)}
        </span>

        {node.gas > 0 && (
          <span
            className="node-gas"
            style={{ color: '#94a3b8', marginLeft: 'auto' }}
          >
            ⛽ {formatGas(node.gas)}
          </span>
        )}

        {isError && (
          <span
            className="node-error"
            style={{ color: '#ef4444', fontWeight: 600, marginLeft: 8 }}
          >
            ⚠️ REVERT
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="node-children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TraceTree({ nodes }: Props) {
  return (
    <div className="trace-tree">
      <h2>🔍 Execution Trace</h2>
      <div className="tree-container">
        {nodes.length === 0 ? (
          <div className="empty">No trace data available</div>
        ) : (
          nodes.map((node) => <TreeNode key={node.id} node={node} depth={0} />)
        )}
      </div>
    </div>
  );
}
