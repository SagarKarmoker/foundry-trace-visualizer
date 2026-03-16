import { calculateStats, formatAddress } from '../utils/traceParser';
import type { TraceNode } from '../utils/traceParser';

interface Props {
  nodes: TraceNode[];
}

export default function TraceStats({ nodes }: Props) {
  const stats = calculateStats(nodes);

  return (
    <div className="trace-stats">
      <h2>📊 Execution Summary</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#22c55e' }}>
            {stats.totalCalls}
          </div>
          <div className="stat-label">Total Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f97316' }}>
            {stats.totalGasUsed >= 1000000
              ? `${(stats.totalGasUsed / 1000000).toFixed(2)}M`
              : stats.totalGasUsed >= 1000
                ? `${(stats.totalGasUsed / 1000).toFixed(0)}K`
                : stats.totalGasUsed}
          </div>
          <div className="stat-label">Gas Used</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {stats.externalCalls}
          </div>
          <div className="stat-label">External Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#8b5cf6' }}>
            {stats.internalCalls}
          </div>
          <div className="stat-label">Internal Calls</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ec4899' }}>
            {stats.contracts.size}
          </div>
          <div className="stat-label">Contracts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#eab308' }}>
            {stats.maxDepth}
          </div>
          <div className="stat-label">Max Depth</div>
        </div>
        {stats.reverts > 0 && (
          <div className="stat-card revert">
            <div className="stat-value">{stats.reverts}</div>
            <div className="stat-label">Reverts</div>
          </div>
        )}
      </div>

      <div className="contracts-section">
        <h3>🏢 Contracts Involved</h3>
        <div className="contracts-list">
          {stats.contracts.size === 0 ? (
            <span className="contract-badge">No contracts found</span>
          ) : (
            Array.from(stats.contracts.entries()).map(([addr, name]) => (
              <span key={addr} className="contract-badge" title={addr}>
                {name || formatAddress(addr)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
