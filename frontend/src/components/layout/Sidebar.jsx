import React from 'react';
import { useLocation } from '../../context/LocationContext';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Map,
  ShieldAlert,
  TrendingUp,
  Database,
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab } = useLocation();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'district', label: 'District Health', icon: Building2 },
    { id: 'village', label: 'Village Intelligence', icon: MapPin },
    { id: 'map', label: 'Risk Map', icon: Map },
    { id: 'interventions', label: 'Priority Interventions', icon: ShieldAlert },
    { id: 'health-intervention', label: 'Health Intervention', icon: Sparkles },
    { id: 'trends', label: 'Health Trends', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 min-h-screen border-r border-slate-800 select-none">
      
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md text-white font-bold">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              GramSwasthya <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Rural Healthcare Intelligence</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Command Center Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer — Data Sources & AI Active Status */}
      <div className="p-4 border-t border-slate-800/80 space-y-3 bg-slate-950/40">
        <div>
          <div className="text-[11px] font-bold text-slate-300 flex items-center space-x-1.5 mb-1">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Data Sources</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Rural Health Statistics • HMIS • NFHS • Anganwadi
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 tracking-wide">AI Analysis Active</span>
          </div>
        </div>
      </div>

    </aside>
  );
};
