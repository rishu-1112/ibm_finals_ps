import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { 
  X, 
  Building, 
  Activity, 
  AlertTriangle, 
  UserCheck, 
  Pill, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const VillageDrawer = () => {
  const { 
    activeVillage, 
    isDrawerOpen, 
    setIsDrawerOpen, 
    setSelectedVillageId, 
    setActiveTab 
  } = useLocation();

  if (!isDrawerOpen || !activeVillage) return null;

  const isCritical = activeVillage.riskLevel === 'Critical';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl relative">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Village Intelligence Drawer</span>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center space-x-2">
              <span>{activeVillage.name}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${
                isCritical ? 'bg-red-950 text-red-400 border-red-500/40' : 'bg-amber-950 text-amber-400 border-amber-500/40'
              }`}>
                {activeVillage.riskLevel}
              </span>
            </h3>
            <p className="text-xs text-slate-400">{activeVillage.block} Block • {activeVillage.districtName} District</p>
          </div>

          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* HES Score Banner */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Healthcare Effectiveness (HES)</span>
            <div className="text-2xl font-black text-teal-400 mt-0.5">{activeVillage.scores.hes}/100</div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Risk Index</span>
            <div className="text-2xl font-black text-red-400 mt-0.5">{activeVillage.riskScore}/100</div>
          </div>
        </div>

        {/* Bottleneck Alert */}
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 space-y-1">
          <div className="font-bold text-amber-400 flex items-center space-x-1">
            <AlertTriangle className="w-4 h-4" />
            <span>Primary Bottleneck</span>
          </div>
          <p>{activeVillage.bottleneck}</p>
        </div>

        {/* 4 Pillars Progress */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-200">4-Pillar Scores</h4>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Infrastructure Score:</span>
                <strong className="text-slate-200">{activeVillage.scores.infrastructure}%</strong>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-sky-500 h-full rounded-full" style={{ width: `${activeVillage.scores.infrastructure}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Service Availability:</span>
                <strong className="text-slate-200">{activeVillage.scores.serviceAvailability}%</strong>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${activeVillage.scores.serviceAvailability}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Service Utilization:</span>
                <strong className="text-slate-200">{activeVillage.scores.utilization}%</strong>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${activeVillage.scores.utilization}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 mb-1">
                <span>Health Outcome:</span>
                <strong className="text-slate-200">{activeVillage.scores.healthOutcome}%</strong>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: `${activeVillage.scores.healthOutcome}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Recommended Intervention */}
        {activeVillage.interventions.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold uppercase text-teal-400">Primary Recommended Action</span>
            <div className="font-extrabold text-slate-100 text-sm">{activeVillage.interventions[0].title}</div>
            <p className="text-slate-400">{activeVillage.interventions[0].rationale}</p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              setIsDrawerOpen(false);
              setSelectedVillageId(activeVillage.id);
              setActiveTab('village');
            }}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <span>Open Full 4-Pillar Gap Profile</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
