import type { Snapshot } from './types';

export function optimizeMODI(
  costs: number[][],
  initialGrid: (number | null)[][],
  snapshots: Snapshot[],
  startStepId: number
) {
  let grid = initialGrid.map(row => [...row]);
  const m = grid.length;
  const n = grid[0].length;
  let stepId = startStepId;
  let isOptimal = false;

  while (!isOptimal) {
    // Calculate u and v
    const u: (number | null)[] = new Array(m).fill(null);
    const v: (number | null)[] = new Array(n).fill(null);

    u[0] = 0;
    let changed = true;
    while (changed) {
      changed = false;
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          if (grid[i][j] !== null) {
            if (u[i] !== null && v[j] === null) {
              v[j] = costs[i][j] - u[i]!;
              changed = true;
            } else if (v[j] !== null && u[i] === null) {
              u[i] = costs[i][j] - v[j]!;
              changed = true;
            }
          }
        }
      }
    }

    // Unresolved variables might occur if graph is disconnected, but IBFS should prevent this.
    // Fill remaining with 0 if somehow disconnected (fallback).
    for(let i=0; i<m; i++) if(u[i]===null) u[i] = 0;
    for(let j=0; j<n; j++) if(v[j]===null) v[j] = 0;

    // Calculate shadow prices
    const shadowPrices: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));
    let minDelta = 0;
    let enterI = -1;
    let enterJ = -1;

    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        if (grid[i][j] === null) {
          const delta = costs[i][j] - (u[i]! + v[j]!);
          shadowPrices[i][j] = delta;
          if (delta < minDelta) {
            minDelta = delta;
            enterI = i;
            enterJ = j;
          }
        }
      }
    }

    if (minDelta >= 0) {
      snapshots.push({
        stepId: stepId++,
        title: 'Optimal Solution Reached',
        description: 'All shadow prices are >= 0.',
        grid: grid.map(row => [...row]),
        u_vars: u,
        v_vars: v,
        shadowPrices,
        isOptimal: true
      });
      isOptimal = true;
      break;
    }

    // Found entering variable, find loop
    const loop = findLoop(grid, enterI, enterJ);
    if (!loop || loop.length === 0) {
      // Degeneracy fallback if no loop (should not happen if m+n-1 holds and connected)
      break;
    }

    // Find max shift (min of minus cells)
    let minShift = Infinity;
    for (let k = 1; k < loop.length; k += 2) {
      const [r, c] = loop[k];
      const val = grid[r][c] as number;
      if (val < minShift) {
        minShift = val;
      }
    }

    snapshots.push({
      stepId: stepId++,
      title: 'Stepping Stone Loop',
      description: `Entering variable at Cell(${enterI + 1}, ${enterJ + 1}) with delta ${minDelta}. Shifting ${minShift === 1e-9 ? 'ε' : minShift}.`,
      grid: grid.map(row => [...row]),
      u_vars: u,
      v_vars: v,
      shadowPrices,
      loop,
      thetaValue: minShift
    });

    // Apply shift
    for (let k = 0; k < loop.length; k++) {
      const [r, c] = loop[k];
      const isPlus = k % 2 === 0;
      let val = grid[r][c] === null ? 0 : grid[r][c] as number;
      
      if (isPlus) {
        val += minShift;
      } else {
        val -= minShift;
      }
      grid[r][c] = val;
    }

    // Remove exiting basic cell (the one that became 0). 
    // Wait, if multiple became 0, only remove one to maintain m+n-1 basic cells!
    let removed = false;
    for (let k = 1; k < loop.length; k += 2) {
      const [r, c] = loop[k];
      if (!removed && Math.abs((grid[r][c] as number)) < 1e-12) {
        grid[r][c] = null; // Removing from basic cells
        removed = true;
      }
    }
  }
}

function findLoop(grid: (number | null)[][], startRow: number, startCol: number): [number, number][] {
  const m = grid.length;
  const n = grid[0].length;
  const visited = new Set<string>();

  function dfs(r: number, c: number, isRowSearch: boolean, path: [number, number][]): [number, number][] | null {
    if (path.length > 3 && r === startRow && c === startCol) {
      return path; // Found loop
    }
    
    const key = `${r},${c},${isRowSearch}`;
    if (visited.has(key)) return null;
    visited.add(key);

    if (isRowSearch) {
      for (let j = 0; j < n; j++) {
        if (j !== c && (grid[r][j] !== null || (r === startRow && j === startCol))) {
          const res = dfs(r, j, !isRowSearch, [...path, [r, j]]);
          if (res) return res;
        }
      }
    } else {
      for (let i = 0; i < m; i++) {
        if (i !== r && (grid[i][c] !== null || (i === startRow && c === startCol))) {
          const res = dfs(i, c, !isRowSearch, [...path, [i, c]]);
          if (res) return res;
        }
      }
    }
    
    return null;
  }

  const loop = dfs(startRow, startCol, true, [[startRow, startCol]]);
  if (loop) {
      // Path includes start at beginning and end. Remove the end duplicate.
      loop.pop(); 
      return loop;
  }
  return [];
}
