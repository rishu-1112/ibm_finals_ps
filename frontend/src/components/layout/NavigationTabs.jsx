import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { 
  LayoutDashboard, 
  Map, 
  Home, 
  BrainCircuit, 
  Lightbulb, 
  TrendingUp, 
  ListOrdered
} from 'lucide-react';

export const NavigationTabs = () => {
  const { activeTab, setActiveTab, activeVillage } = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Interactive Risk Map', icon: Map },
    { 
      id: 'village', 
      label: `Village Profile & Gap Analysis ${activeVillage ? `(${activeVillage.name})` : ''}`, 
      icon: Home 
    },
    { id: 'ai-risk', label: 'AI Risk & SHAP Explainability', icon: BrainCircuit },
    { id: 'intervention', label: 'AI Intervention & What-If Simulator', icon: Lightbulb },
    { id: 'trends', label: 'Trends & Early Warning', icon: TrendingUp },
    { id: 'priority', label: 'Resource Priority Planner', icon: ListOrdered }
  ];

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-teal-950 text-teal-300 border border-teal-500/40 shadow-sm shadow-teal-950/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
