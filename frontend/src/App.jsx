import React from 'react';
import { LocationProvider, useLocation } from './context/LocationContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/modules/OverviewDashboard';
import { DistrictDashboard } from './components/modules/DistrictDashboard';
import { VillageHealthProfile } from './components/modules/VillageHealthProfile';
import { InteractiveRiskMap } from './components/modules/InteractiveRiskMap';
import { PriorityPlanner } from './components/modules/PriorityPlanner';
import { TrendsAndForecast } from './components/modules/TrendsAndForecast';

function MainArea() {
  const { activeTab } = useLocation();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <Header />
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
        {(activeTab === 'overview' || activeTab === 'dashboard') && <OverviewDashboard />}
        {activeTab === 'district' && <DistrictDashboard />}
        {activeTab === 'village' && <VillageHealthProfile />}
        {activeTab === 'map' && <InteractiveRiskMap />}
        {(activeTab === 'interventions' || activeTab === 'priority' || activeTab === 'intervention') && <PriorityPlanner />}
        {(activeTab === 'trends' || activeTab === 'ai-risk') && <TrendsAndForecast />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
        <Sidebar />
        <MainArea />
      </div>
    </LocationProvider>
  );
}
