import { useState } from 'react';
import { GridInput } from './components/GridInput';
import { Visualization } from './components/Visualization';
import type { ProblemData, Snapshot } from './mathEngine/types';
import { solveTransportation, type SolverMethod } from './mathEngine/solver';
import { Play, SkipBack, SkipForward, Settings2 } from 'lucide-react';

function App() {
  const [m, setM] = useState(3);
  const [n, setN] = useState(4);
  const [method, setMethod] = useState<SolverMethod>('VAM');
  const [data, setData] = useState<ProblemData>({
    costs: Array.from({ length: 3 }, () => new Array(4).fill(0)),
    supply: new Array(3).fill(0),
    demand: new Array(4).fill(0),
  });

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [balancedCosts, setBalancedCosts] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSolved, setHasSolved] = useState(false);

  const handleResize = (newM: number, newN: number) => {
    setM(newM);
    setN(newN);
    setData({
      costs: Array.from({ length: newM }, (_, i) => 
        Array.from({ length: newN }, (_, j) => data.costs[i]?.[j] || 0)
      ),
      supply: Array.from({ length: newM }, (_, i) => data.supply[i] || 0),
      demand: Array.from({ length: newN }, (_, j) => data.demand[j] || 0),
    });
    setHasSolved(false);
  };

  const handleSolve = () => {
    try {
      const result = solveTransportation(data, method);
      setSnapshots(result.snapshots);
      setBalancedCosts(result.balancedCosts);
      setCurrentStep(0);
      setHasSolved(true);
    } catch (e: any) {
      alert("Error solving: " + e.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Transport Method Optimizer
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          Operations Research Logistics Calculator
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Volver
        </button>
      </div>

      {!hasSolved ? (
        <div className="glass-panel animate-fade-in">
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Sources (Rows):</label>
              <input type="number" min="1" max="10" className="input-field" style={{ width: '80px' }} value={m} onChange={(e) => handleResize(parseInt(e.target.value) || 1, n)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label>Destinations (Cols):</label>
              <input type="number" min="1" max="10" className="input-field" style={{ width: '80px' }} value={n} onChange={(e) => handleResize(m, parseInt(e.target.value) || 1)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
              <Settings2 size={18} style={{ color: 'var(--accent)' }}/>
              <select className="input-field" style={{ width: 'auto' }} value={method} onChange={(e) => setMethod(e.target.value as SolverMethod)}>
                <option value="VAM">Vogel's Approximation (VAM)</option>
                <option value="LCM">Least Cost Method (LCM)</option>
                <option value="NWCM">North-West Corner (NWCM)</option>
              </select>
            </div>
          </div>

          <GridInput m={m} n={n} data={data} setData={setData} />
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <button className="btn" style={{ padding: '12px 30px', fontSize: '1.1rem' }} onClick={handleSolve}>
              <Play size={20} /> Compute Optimal Routes
            </button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <button className="btn btn-secondary" onClick={() => setHasSolved(false)}>
              Edit Matrix
            </button>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(s => Math.max(0, s - 1))} disabled={currentStep === 0}>
                <SkipBack size={18} /> Prev
              </button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                Step {currentStep + 1} of {snapshots.length}
              </div>
              <button className="btn btn-secondary" onClick={() => setCurrentStep(s => Math.min(snapshots.length - 1, s + 1))} disabled={currentStep === snapshots.length - 1}>
                Next <SkipForward size={18} />
              </button>
            </div>
          </div>
          
          {snapshots.length > 0 && (
            <Visualization snapshot={snapshots[currentStep]} costs={balancedCosts} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
