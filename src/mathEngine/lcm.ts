import type { Snapshot } from './types';
import { EPSILON } from './solver';

export function calculateLCM(
  costs: number[][],
  supply: number[],
  demand: number[],
  snapshots: Snapshot[],
  startStepId: number
): (number | null)[][] {
  const m = supply.length;
  const n = demand.length;
  const supplyRemain = [...supply];
  const demandRemain = [...demand];
  const supplyMet = new Array(m).fill(false);
  const demandMet = new Array(n).fill(false);
  const grid: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));

  let stepId = startStepId;
  let basicCellsCount = 0;

  const cells = [];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      cells.push({ i, j, cost: costs[i][j] });
    }
  }

  cells.sort((a, b) => a.cost - b.cost);

  for (const cell of cells) {
    if (basicCellsCount >= m + n - 1) break;

    const { i, j } = cell;
    if (supplyMet[i] || demandMet[j]) continue;

    const allocation = Math.min(supplyRemain[i], demandRemain[j]);
    const actualAllocation = allocation === 0 ? EPSILON : allocation;
    
    grid[i][j] = actualAllocation;
    basicCellsCount++;
    supplyRemain[i] -= allocation;
    demandRemain[j] -= allocation;

    snapshots.push({
      stepId: stepId++,
      title: 'Least Cost Method Allocation',
      description: `Allocated ${allocation === 0 ? 'ε' : allocation} at Cell(${i + 1}, ${j + 1}) (Cost: ${cell.cost})`,
      grid: grid.map(row => [...row]),
      u_vars: [],
      v_vars: []
    });

    if (supplyRemain[i] === 0 && demandRemain[j] === 0) {
      if (basicCellsCount === m + n - 1) {
        supplyMet[i] = true;
        demandMet[j] = true;
      } else {
        supplyMet[i] = true; // Arbitrarily cross out row to allow epsilon in column
      }
    } else if (supplyRemain[i] === 0) {
      supplyMet[i] = true;
    } else {
      demandMet[j] = true;
    }
  }

  return grid;
}
