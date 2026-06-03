export type Cell = {
  row: number;
  col: number;
  cost: number;
  isDummyRow?: boolean;
  isDummyCol?: boolean;
  isProhibited?: boolean;
};

export type Snapshot = {
  stepId: number;
  title: string;
  description: string;
  grid: (number | null)[][]; // null means empty cell, number is the allocation. epsilon is represented as a very small number like 1e-9 but rendered as ε
  u_vars: (number | null)[]; // row dual variables
  v_vars: (number | null)[]; // col dual variables
  loop?: [number, number][]; // coordinates for stepping stone loop
  thetaValue?: number;
  isOptimal?: boolean;
  shadowPrices?: (number | null)[][];
};

export type ProblemData = {
  costs: number[][]; // m x n
  supply: number[]; // m
  demand: number[]; // n
  prohibited?: [number, number][]; // Array of [row, col]
};
