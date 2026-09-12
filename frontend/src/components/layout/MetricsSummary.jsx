import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { 
  Building, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  Users, 
  TrendingUp,
  Filter,
  CheckCircle2
} from 'lucide-react';

export const MetricsSummary = () => {
  const { 
    districtMetrics, 
    currentDistrict, 
    riskFilter, 
    setRiskFilter,
    filteredVillages 
  } = useLocation();

  const riskBadges = [
    { id: 'ALL', label: 'All Villages', count: districtMetrics.totalVillages, color: 'border-slate-700 bg-slate-800/60 text-slate-300' },
    { id: 'Critical', label: 'Critical Risk', count: districtMetrics.criticalCount, color: 'border-red-500/50 bg-red-950/40 text-red-400' },
    { id: 'High', label: 'High Risk', count: districtMetrics.highCount, color: 'border-amber-500/50 bg-amber-950/40 text-amber-400' },
    { id: 'Moderate', label: 'Moderate Risk', count: districtMetrics.moderateCount, color: 'border-yellow-500/50 bg-yellow-950/40 text-yellow-400' },
    { id: 'Low', label: 'Low Risk', count: districtMetrics.lowCount, color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400' }
  ];

  return (
    <div className="bg-slate-900/40 border-b border-slate-800/80 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* District Title & Overview */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>{currentDistrict.name} District Intelligence Overview</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-950 border border-teal-500/30 text-teal-300">
                {filteredVillages.length} Villages Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Composite analytics across RHS facilities, HMIS utilization, NFHS-5 health outcomes & POSHAN nutrition tracker.
            </p>
          </div>

          {/* Quick Risk Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 mr-1">
              <Filter className="w-3 h-3 text-teal-400" />
              <span>Risk Filter:</span>
            </span>
            {riskBadges.map(badge => (
              <button
                key={badge.id}
                onClick={() => setRiskFilter(badge.id)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
                  riskFilter === badge.id 
                    ? 'ring-2 ring-teal-400 ring-offset-1 ring-offset-slate-950 shadow-md' 
                    : 'opacity-80 hover:opacity-100'
                } ${badge.color}`}
              >
                <span>{badge.label}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 font-bold">
                  {badge.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 5 Main Executive KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* KPI 1: Villages Monitored */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Monitored Villages</span>
              <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center">
                <Building className="w-4 h-4 text-teal-400" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-100">{districtMetrics.totalVillages}</span>
              <span className="text-xs text-teal-400 font-medium">Villages</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Under 5: <strong>{districtMetrics.totalUnder5.toLocaleString()}</strong></span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          </div>

          {/* KPI 2: Avg Healthcare Effectiveness Score (HES) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden group hover:border-teal-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Avg HES Score</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-emerald-400">{districtMetrics.avgHes}<span className="text-xs font-medium text-slate-400">/100</span></span>
              <span className="text-xs text-amber-400 font-medium flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +2.4%
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Infra: {districtMetrics.avgInfra} | Util: {districtMetrics.avgUtil}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          </div>

          {/* KPI 3: High & Critical Risk Count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden group hover:border-red-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">At-Risk Villages</span>
              <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-500/40 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-red-400">
                {districtMetrics.criticalCount + districtMetrics.highCount}
              </span>
              <span className="text-[11px] font-semibold text-red-400/90 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-800">
                {districtMetrics.criticalCount} Critical
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Immediate intervention needed
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-amber-500"></div>
          </div>

          {/* KPI 4: Infrastructure vs Effectiveness Paradox */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-300">Paradox Flagged</span>
              <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-amber-400">
                {districtMetrics.paradoxVillagesCount}
              </span>
              <span className="text-xs text-slate-400">Villages</span>
            </div>
            <div className="mt-1 text-[10px] text-amber-300/80 font-medium truncate" title="Infra exists but outcomes are failing">
              Infra &gt; 60% but Low Delivery
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
          </div>

          {/* KPI 5: Population At-Risk */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all col-span-2 md:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Population At Risk</span>
              <div className="w-7 h-7 rounded-lg bg-blue-950 border border-blue-500/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-black text-slate-100">
                {Math.round(districtMetrics.totalPopulation * 0.42).toLocaleString()}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Pregnant: <strong>{districtMetrics.totalPregnant}</strong>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          </div>

        </div>
      </div>
    </div>
  );
};
