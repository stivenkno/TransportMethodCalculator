import React from 'react';
import { CellInput } from './CellInput';
import type { ProblemData } from '../mathEngine/types';

interface GridInputProps {
  m: number;
  n: number;
  data: ProblemData;
  setData: (data: ProblemData) => void;
}

export const GridInput: React.FC<GridInputProps> = ({ m, n, data, setData }) => {
  const updateCost = (i: number, j: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newCosts = data.costs.map((row, rIdx) => 
      rIdx === i ? row.map((c, cIdx) => cIdx === j ? num : c) : row
    );
    setData({ ...data, costs: newCosts });
  };

  const updateSupply = (i: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newSupply = [...data.supply];
    newSupply[i] = num;
    setData({ ...data, supply: newSupply });
  };

  const updateDemand = (j: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newDemand = [...data.demand];
    newDemand[j] = num;
    setData({ ...data, demand: newDemand });
  };

  return (
    <div style={{ overflowX: 'auto', padding: '10px 0' }}>
      <table style={{ borderSpacing: '8px', borderCollapse: 'separate', margin: '0 auto' }}>
        <thead>
          <tr>
            <th></th>
            {Array.from({ length: n }).map((_, j) => (
              <th key={`h-${j}`} style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>D{j + 1}</th>
            ))}
            <th style={{ color: 'var(--accent)', fontWeight: 600 }}>Supply</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: m }).map((_, i) => (
            <tr key={`r-${i}`}>
              <th style={{ color: 'var(--text-secondary)', fontWeight: 500, paddingRight: '12px' }}>S{i + 1}</th>
              {Array.from({ length: n }).map((_, j) => (
                <td key={`c-${i}-${j}`}>
                  <CellInput
                    initialValue={data.costs[i]?.[j]?.toString() || '0'}
                    onCommit={(val) => updateCost(i, j, val)}
                  />
                </td>
              ))}
              <td>
                <CellInput
                  initialValue={data.supply[i]?.toString() || '0'}
                  onCommit={(val) => updateSupply(i, val)}
                  className="supply-input"
                />
              </td>
            </tr>
          ))}
          <tr>
            <th style={{ color: 'var(--warning)', fontWeight: 600, paddingTop: '12px' }}>Demand</th>
            {Array.from({ length: n }).map((_, j) => (
              <td key={`d-${j}`} style={{ paddingTop: '12px' }}>
                <CellInput
                  initialValue={data.demand[j]?.toString() || '0'}
                  onCommit={(val) => updateDemand(j, val)}
                  className="demand-input"
                />
              </td>
            ))}
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
