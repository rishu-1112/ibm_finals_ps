import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { Bell, MapPin, CheckCircle2 } from 'lucide-react';

export const Header = () => {
  const {
    states,
    selectedStateId,
    selectedDistrictId,
    currentState,
    handleStateChange,
    setSelectedDistrictId
  } = useLocation();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
      
      {/* Title & Tagline */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Rural Healthcare Intelligence
        </h1>
        <p className="text-xs text-slate-600 font-medium">
          Predictive insights for better rural healthcare resource allocation
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-4">
        
        {/* Functional Location Selector */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-600" />
          
          <select
            value={selectedStateId}
            onChange={(e) => handleStateChange(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            {states.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          
          <span className="text-slate-400 font-normal">/</span>
          
          <select
            value={selectedDistrictId}
            onChange={(e) => setSelectedDistrictId(e.target.value)}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            {currentState.districts.map(d => (
              <option key={d.id} value={d.id}>{d.name} District</option>
            ))}
          </select>
        </div>

        {/* Data Status */}
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Data Updated</span>
        </div>

        {/* Notification Icon */}
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors border border-slate-200 cursor-pointer" title="Notifications">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
        </button>

      </div>

    </header>
  );
};
