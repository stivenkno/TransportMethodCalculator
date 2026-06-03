import type { Snapshot } from './types';
import { EPSILON } from './solver';

export function calculateNWCM(
  _costs: number[][],
  supply: number[],
  demand: number[],
  snapshots: Snapshot[],
  startStepId: number
): (number | null)[][] {
  const m = supply.length;
  const n = demand.length;
  const supplyRemain = [...supply];
  const demandRemain = [...demand];
  const grid: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));

  let i = 0;
  let j = 0;
  let stepId = startStepId;
  let basicCellsCount = 0;

  while (i < m && j < n) {
    const allocation = Math.min(supplyRemain[i], demandRemain[j]);
    const actualAllocation = allocation === 0 ? EPSILON : allocation; // Degeneracy handling
    grid[i][j] = actualAllocation;
    basicCellsCount++;

    supplyRemain[i] -= allocation;
    demandRemain[j] -= allocation;

    snapshots.push({
      stepId: stepId++,
      title: 'North-West Corner Method Allocation',
      description: `Allocated ${allocation === 0 ? 'ε' : allocation} at Cell(${i + 1}, ${j + 1})`,
      grid: grid.map(row => [...row]),
      u_vars: [],
      v_vars: []
    });

    if (supplyRemain[i] === 0 && demandRemain[j] === 0) {
      if (basicCellsCount === m + n - 1) {
        break; // Reached basic cell count
      }
      // Degeneracy hit
      i++;
    } else if (supplyRemain[i] === 0) {
      i++;
    } else {
      j++;
    }
  }

  // Ensure m+n-1 basic cells
  while (basicCellsCount < m + n - 1) {
    if (i < m - 1) i++;
    else if (j < n - 1) j++;
    grid[i][j] = EPSILON;
    basicCellsCount++;
    snapshots.push({
      stepId: stepId++,
      title: 'NWCM Degeneracy Fix',
      description: `Injected ε at Cell(${i + 1}, ${j + 1}) to maintain m+n-1 basic cells`,
      grid: grid.map(row => [...row]),
      u_vars: [],
      v_vars: []
    });
  }

  return grid;
}
