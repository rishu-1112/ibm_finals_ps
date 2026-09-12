import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { 
  Lightbulb, 
  Sparkles, 
  CheckSquare, 
  ArrowUpRight, 
  Sliders, 
  TrendingUp, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIInterventionEngine = () => {
  const { 
    activeVillage, 
    simulationParams, 
    setSimulationParams, 
    simulatedVillageMetrics 
  } = useLocation();

  if (!activeVillage) return null;

  const handleRunSimulation = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const resetSimulation = () => {
    setSimulationParams({
      doctorDelta: 0,
      anmDelta: 0,
      medicineBoost: 0,
      mmuFrequency: 'Monthly'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-100 flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <span>AI Intervention Recommendation Engine</span>
          </h3>
          <p className="text-xs text-slate-400">
            Target Village: <strong className="text-slate-200">{activeVillage.name}</strong> ({activeVillage.block} Block)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-500/30">
            Rule-Engine + ML Optimizer Active
          </span>
        </div>
      </div>

      {/* Grid: Recommended Interventions (Left 2 Cols) + Interactive What-If Simulator (Right 1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended AI Interventions (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>Prioritized AI Interventions for {activeVillage.name}</span>
          </h4>

          <div className="space-y-4">
            {activeVillage.interventions.map((intervention, idx) => (
              <div 
                key={intervention.id} 
                className="bg-slate-900/90 border border-slate-800 hover:border-teal-500/40 rounded-2xl p-5 shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-500/40">
                        {intervention.type}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40">
                        Urgency: {intervention.urgency}
                      </span>
                    </div>
                    <h5 className="text-base font-extrabold text-slate-100 mt-1">{intervention.title}</h5>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Estimated Budget</span>
                      <strong className="text-slate-100 font-bold">{intervention.estimatedCost}</strong>
                    </div>
                    <div className="text-right bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30">
                      <span className="text-emerald-400 block text-[10px] font-semibold">Predicted Impact</span>
                      <strong className="text-emerald-300 font-extrabold">{intervention.projectedHesIncrease} HES</strong>
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <strong className="text-teal-400 block mb-0.5">Clinical & AI Rationale:</strong>
                  {intervention.rationale}
                </div>

                {/* Action Steps Checklist */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-400 block">Recommended Deployment Protocol:</span>
                  {intervention.steps.map((step, sIdx) => (
                    <div key={sIdx} className="flex items-center space-x-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive "What-If" Scenario Simulator (1 Col) */}
        <div className="bg-slate-900/90 border border-teal-500/40 rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>"What-If" Resource Simulator</span>
            </h4>
            <button
              onClick={resetSimulation}
              className="text-[11px] text-slate-400 hover:text-teal-300 flex items-center space-x-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Adjust resource allocations below to dynamically simulate predicted impact on village risk score and Healthcare Effectiveness Score (HES).
          </p>

          {/* Controls */}
          <div className="space-y-4 text-xs">
            
            {/* Slider 1: Doctor Delta */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Add Medical Officers (Doctors):</span>
                <span className="text-teal-400 font-bold">+{simulationParams.doctorDelta} Doctors</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={simulationParams.doctorDelta}
                onChange={(e) => setSimulationParams({ ...simulationParams, doctorDelta: parseInt(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: ANM Delta */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Add ANMs (Nurse Midwives):</span>
                <span className="text-teal-400 font-bold">+{simulationParams.anmDelta} ANMs</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={simulationParams.anmDelta}
                onChange={(e) => setSimulationParams({ ...simulationParams, anmDelta: parseInt(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Medicine Stock Boost */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Drug & Vaccine Stock Boost:</span>
                <span className="text-teal-400 font-bold">+{simulationParams.medicineBoost}% Stock</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="10"
                value={simulationParams.medicineBoost}
                onChange={(e) => setSimulationParams({ ...simulationParams, medicineBoost: parseInt(e.target.value) })}
                className="w-full accent-teal-400 cursor-pointer"
              />
            </div>

            {/* Select 4: MMU Frequency */}
            <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between font-semibold text-slate-200">
                <span>Mobile Medical Unit (MMU):</span>
                <span className="text-teal-400 font-bold">{simulationParams.mmuFrequency}</span>
              </div>
              <select
                value={simulationParams.mmuFrequency}
                onChange={(e) => setSimulationParams({ ...simulationParams, mmuFrequency: e.target.value })}
                className="w-full bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg p-2 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="None">None (0 visits/mo)</option>
                <option value="Monthly">Monthly Visit</option>
                <option value="Bi-weekly">Bi-weekly Visit</option>
                <option value="Weekly">Weekly Express Route</option>
              </select>
            </div>

          </div>

          {/* Real-time Recalculated Simulated Output Display */}
          {simulatedVillageMetrics && (
            <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/50 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 block">Simulated Output Projection</span>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Simulated HES</span>
                  <div className="text-xl font-black text-emerald-400">{simulatedVillageMetrics.simulatedHes}</div>
                  <span className="text-[10px] text-emerald-400 font-bold">+{simulatedVillageMetrics.hesDelta} pts</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Predicted Risk Score</span>
                  <div className="text-xl font-black text-amber-400">{simulatedVillageMetrics.simulatedRisk}</div>
                  <span className="text-[10px] text-teal-400 font-bold">{simulatedVillageMetrics.riskDelta} pts</span>
                </div>
              </div>

              <button
                onClick={handleRunSimulation}
                className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simulate & Apply to Action Plan</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
