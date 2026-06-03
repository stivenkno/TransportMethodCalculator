import type { ProblemData, Snapshot } from './types';
import { calculateNWCM } from './nwcm';
import { calculateLCM } from './lcm';
import { calculateVAM } from './vam';
import { optimizeMODI } from './modi';

export const EPSILON = 1e-9;
export const BIG_M = 999999;

export type SolverMethod = 'NWCM' | 'LCM' | 'VAM';

export function solveTransportation(data: ProblemData, method: SolverMethod): { snapshots: Snapshot[], balancedCosts: number[][], balancedSupply: number[], balancedDemand: number[] } {
  const snapshots: Snapshot[] = [];
  let stepId = 0;

  // 1. Auto-balancing
  let { costs, supply, demand, prohibited } = data;
  let totalSupply = supply.reduce((a, b) => a + b, 0);
  let totalDemand = demand.reduce((a, b) => a + b, 0);

  const balancedCosts = costs.map(row => [...row]);
  const balancedSupply = [...supply];
  const balancedDemand = [...demand];

  if (totalSupply < totalDemand) {
    // Add Dummy Row
    const dummySupply = totalDemand - totalSupply;
    balancedSupply.push(dummySupply);
    balancedCosts.push(new Array(balancedDemand.length).fill(0));
  } else if (totalSupply > totalDemand) {
    // Add Dummy Col
    const dummyDemand = totalSupply - totalDemand;
    balancedDemand.push(dummyDemand);
    for (let i = 0; i < balancedCosts.length; i++) {
      balancedCosts[i].push(0);
    }
  }

  // Apply Prohibited
  if (prohibited) {
    for (const [r, c] of prohibited) {
      balancedCosts[r][c] = BIG_M;
    }
  }

  const m = balancedSupply.length;
  const n = balancedDemand.length;

  let initialGrid: (number | null)[][] = Array.from({ length: m }, () => new Array(n).fill(null));

  // 2. Initial Basic Feasible Solution (IBFS)
  if (method === 'NWCM') {
    initialGrid = calculateNWCM(balancedCosts, balancedSupply, balancedDemand, snapshots, stepId);
  } else if (method === 'LCM') {
    initialGrid = calculateLCM(balancedCosts, balancedSupply, balancedDemand, snapshots, stepId);
  } else {
    initialGrid = calculateVAM(balancedCosts, balancedSupply, balancedDemand, snapshots, stepId);
  }

  stepId = snapshots.length;

  // 3. Optimization (MODI + Stepping Stone)
  optimizeMODI(balancedCosts, initialGrid, snapshots, stepId);

  return { snapshots, balancedCosts, balancedSupply, balancedDemand };
}
