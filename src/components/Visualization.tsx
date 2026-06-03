import React from 'react';
import type { Snapshot } from '../mathEngine/types';
import { EPSILON, BIG_M } from '../mathEngine/solver';

interface VisualizationProps {
  snapshot: Snapshot;
  costs: number[][];
}

export const Visualization: React.FC<VisualizationProps> = ({ snapshot, costs }) => {
  // const m = snapshot.grid.length;
  const n = snapshot.grid[0].length;
  
  return (
    <div className="glass-panel animate-fade-in" style={{ marginTop: '24px' }}>
      <h3 style={{ color: 'var(--accent)', marginBottom: '8px' }}>Step {snapshot.stepId + 1}: {snapshot.title}</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{snapshot.description}</p>
      
      <div style={{ overflowX: 'auto', padding: '10px 0', position: 'relative' }}>
        <table style={{ borderSpacing: '4px', borderCollapse: 'separate', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <thead>
            <tr>
              <th></th>
              {Array.from({ length: n }).map((_, j) => (
                <th key={`h-${j}`} style={{ color: 'var(--text-secondary)', fontWeight: 500, paddingBottom: '8px' }}>
                  D{j + 1}
                  {snapshot.v_vars && snapshot.v_vars[j] !== null && (
                    <div style={{ fontSize: '0.8em', color: 'var(--warning)' }}>v={snapshot.v_vars[j]}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {snapshot.grid.map((row, i) => (
              <tr key={`r-${i}`}>
                <th style={{ color: 'var(--text-secondary)', fontWeight: 500, paddingRight: '12px' }}>
                  S{i + 1}
                  {snapshot.u_vars && snapshot.u_vars[i] !== null && (
                    <div style={{ fontSize: '0.8em', color: 'var(--warning)' }}>u={snapshot.u_vars[i]}</div>
                  )}
                </th>
                {row.map((val, j) => {
                  const isLoopNode = snapshot.loop?.some(([lr, lc]) => lr === i && lc === j);
                  const isBasic = val !== null;
                  const displayVal = val === EPSILON ? 'ε' : val;
                  const cost = costs[i][j] === BIG_M ? '∞' : costs[i][j];
                  const shadowPrice = snapshot.shadowPrices?.[i]?.[j];

                  return (
                    <td key={`c-${i}-${j}`} style={{ position: 'relative' }}>
                      <div style={{
                        width: '70px',
                        height: '70px',
                        background: isLoopNode ? 'rgba(59, 130, 246, 0.2)' : isBasic ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${isLoopNode ? 'var(--accent)' : isBasic ? 'var(--success)' : 'var(--panel-border)'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transition: 'all 0.3s'
                      }}>
                        <div style={{ position: 'absolute', top: '4px', right: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {cost}
                        </div>
                        {isBasic && (
                          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {displayVal}
                          </div>
                        )}
                        {!isBasic && shadowPrice !== undefined && shadowPrice !== null && (
                          <div style={{ fontSize: '0.85rem', color: shadowPrice < 0 ? 'var(--danger)' : 'var(--text-secondary)' }}>
                            Δ={shadowPrice}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
