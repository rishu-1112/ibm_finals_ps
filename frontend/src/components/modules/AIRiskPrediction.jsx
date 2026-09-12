import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { 
  BrainCircuit, 
  Cpu, 
  AlertTriangle, 
  Layers, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Sliders,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

export const AIRiskPrediction = () => {
  const { activeVillage } = useLocation();
  const [selectedModel, setSelectedModel] = useState('xgboost');

  if (!activeVillage) return null;

  const shapData = activeVillage.shapFactors.map(f => ({
    name: f.factor.length > 25 ? f.factor.substring(0, 25) + '...' : f.factor,
    fullFactor: f.factor,
    impact: Math.abs(f.impact),
    type: f.type,
    fill: f.type === 'negative' ? '#ef4444' : '#10b981'
  }));

  return (
    <div className="space-y-6">
      
      {/* ML Model Engine Switcher Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-extrabold text-slate-100">
              AI Risk Prediction & SHAP Feature Explainability
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Target Village: <strong className="text-slate-200">{activeVillage.name}</strong> ({activeVillage.block} Block)
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold px-2">ML Engine:</span>
          <button
            onClick={() => setSelectedModel('xgboost')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedModel === 'xgboost' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            XGBoost Predictor
          </button>
          <button
            onClick={() => setSelectedModel('rf')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              selectedModel === 'rf' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Random Forest
          </button>
        </div>
      </div>

      {/* Main Risk Prediction Score & Explainability Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SHAP Feature Contribution Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>SHAP Feature Contribution Weights (Explainability)</span>
              </h4>
              <p className="text-xs text-slate-400">
                Shows exact mathematical weight of top variables driving this village's risk score.
              </p>
            </div>
            <span className="text-xs text-teal-400 font-semibold bg-teal-950 px-2.5 py-1 rounded-md border border-teal-500/30">
              SHAP Value Explainer
            </span>
          </div>

          {/* Recharts SHAP Bar Chart */}
          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={shapData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" domain={[0, 50]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" width={160} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(value, name, props) => [`${value}% Contribution`, props.payload.fullFactor]}
                />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Factor Cards */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h5 className="text-xs font-semibold text-slate-300">Detailed Driver Decomposition</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeVillage.shapFactors.map((factor, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  factor.type === 'negative' ? 'bg-red-950/30 border-red-500/30 text-red-300' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                }`}>
                  <span className="font-medium pr-2">{factor.factor}</span>
                  <span className="font-extrabold shrink-0">
                    {factor.type === 'negative' ? `+${factor.impact}% Risk` : `${factor.impact}% Protection`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Anomaly Detection & Archetype Clustering (1 Col) */}
        <div className="space-y-6">
          
          {/* Isolation Forest Anomaly Detection */}
          <div className={`p-5 rounded-2xl border ${
            activeVillage.anomaly.flagged
              ? 'bg-gradient-to-b from-red-950/60 to-slate-900 border-red-500/40'
              : 'bg-slate-900 border-slate-800'
          } space-y-3`}>
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-5 h-5 ${activeVillage.anomaly.flagged ? 'text-red-400 animate-bounce' : 'text-teal-400'}`} />
              <div>
                <h4 className="text-sm font-bold text-slate-100">Anomaly Detection Engine</h4>
                <span className="text-[10px] text-slate-400 font-mono">Algorithm: Isolation Forest</span>
              </div>
            </div>

            {activeVillage.anomaly.flagged ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 space-y-1">
                  <div className="font-extrabold text-red-300">{activeVillage.anomaly.title}</div>
                  <p className="text-[11px] text-red-300/80">Period: {activeVillage.anomaly.period} • Severity: {activeVillage.anomaly.severity}</p>
                </div>
                <p className="text-xs text-slate-300">
                  Isolation Forest flagged an unexpected metric anomaly deviating &gt;3.2 standard deviations from district baseline.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                No statistical anomalies detected in recent 90-day time-series window.
              </div>
            )}
          </div>

          {/* K-Means Cluster Archetype */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">Village Clustering Profile</h4>
                <span className="text-[10px] text-slate-400 font-mono">Algorithm: K-Means (k=4)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-xs text-teal-200 space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-teal-400">Archetype Designation</span>
              <div className="font-bold text-slate-100">{activeVillage.clusterArchetype}</div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This village shares high similarity vector embeddings with 8 other regional villages characterized by structural delivery gaps.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
