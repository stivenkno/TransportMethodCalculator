import type { Snapshot } from './types';
import { EPSILON, BIG_M } from './solver';

export function calculateVAM(
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

  while (basicCellsCount < m + n - 1) {
    let maxPenalty = -1;
    let targetRow = -1;
    let targetCol = -1;
    let isRow = true;

    const rowPenalties = [];
    for (let i = 0; i < m; i++) {
      if (supplyMet[i]) {
        rowPenalties.push(-1);
        continue;
      }
      let min1 = BIG_M + 1, min2 = BIG_M + 1;
      for (let j = 0; j < n; j++) {
        if (!demandMet[j]) {
          if (costs[i][j] < min1) {
            min2 = min1;
            min1 = costs[i][j];
          } else if (costs[i][j] < min2) {
            min2 = costs[i][j];
          }
        }
      }
      const penalty = min2 === BIG_M + 1 ? (min1 === BIG_M + 1 ? 0 : min1) : min2 - min1;
      rowPenalties.push(penalty);
      if (penalty > maxPenalty) {
        maxPenalty = penalty;
        targetRow = i;
        isRow = true;
      }
    }

    const colPenalties = [];
    for (let j = 0; j < n; j++) {
      if (demandMet[j]) {
        colPenalties.push(-1);
        continue;
      }
      let min1 = BIG_M + 1, min2 = BIG_M + 1;
      for (let i = 0; i < m; i++) {
        if (!supplyMet[i]) {
          if (costs[i][j] < min1) {
            min2 = min1;
            min1 = costs[i][j];
          } else if (costs[i][j] < min2) {
            min2 = costs[i][j];
          }
        }
      }
      const penalty = min2 === BIG_M + 1 ? (min1 === BIG_M + 1 ? 0 : min1) : min2 - min1;
      colPenalties.push(penalty);
      if (penalty > maxPenalty) {
        maxPenalty = penalty;
        targetCol = j;
        isRow = false;
      }
    }

    // Find min cost in target row or col
    let minCost = BIG_M + 1;
    if (isRow) {
      for (let j = 0; j < n; j++) {
        if (!demandMet[j] && costs[targetRow][j] < minCost) {
          minCost = costs[targetRow][j];
          targetCol = j;
        }
      }
    } else {
      for (let i = 0; i < m; i++) {
        if (!supplyMet[i] && costs[i][targetCol] < minCost) {
          minCost = costs[i][targetCol];
          targetRow = i;
        }
      }
    }

    // Allocate
    if (targetRow === -1 || targetCol === -1) {
       // Should not happen, just fallback
       break;
    }

    const allocation = Math.min(supplyRemain[targetRow], demandRemain[targetCol]);
    const actualAllocation = allocation === 0 ? EPSILON : allocation;
    grid[targetRow][targetCol] = actualAllocation;
    basicCellsCount++;

    supplyRemain[targetRow] -= allocation;
    demandRemain[targetCol] -= allocation;

    snapshots.push({
      stepId: stepId++,
      title: 'VAM Allocation',
      description: `Max penalty ${maxPenalty}. Allocated ${allocation === 0 ? 'ε' : allocation} at Cell(${targetRow + 1}, ${targetCol + 1})`,
      grid: grid.map(row => [...row]),
      u_vars: [],
      v_vars: []
    });

    if (supplyRemain[targetRow] === 0 && demandRemain[targetCol] === 0) {
      if (basicCellsCount === m + n - 1) {
        supplyMet[targetRow] = true;
        demandMet[targetCol] = true;
      } else {
        supplyMet[targetRow] = true;
      }
    } else if (supplyRemain[targetRow] === 0) {
      supplyMet[targetRow] = true;
    } else {
      demandMet[targetCol] = true;
    }
  }

  return grid;
}
