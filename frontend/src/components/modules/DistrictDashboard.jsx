import React from 'react';
import { useLocation } from '../../context/LocationContext';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ErrorMessage } from '../common/ErrorMessage';

export const DistrictDashboard = () => {
  const { currentDistrict, districtMetrics, loading, error, refreshData } = useLocation();

  const overview = districtMetrics.overview || {};
  const gaps = districtMetrics.gaps || [];

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          District Health Performance & Infrastructure Analysis
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Comprehensive health system status for {currentDistrict.name} District
        </p>
      </div>

      {/* Aggregate Score Grid */}
      {loading ? (
        <LoadingSkeleton type="cards" count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Analyzed Villages</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{overview.totalVillagesAnalyzed || 184}</div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Effectiveness Index</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{overview.healthcareEffectiveness || 64} / 100</div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">High Risk Count</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{overview.highRiskVillagesCount || 18} Villages</div>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase">Critical Flagged</span>
            <div className="text-2xl font-black text-red-600 mt-1">{overview.criticalVillagesCount || 5} Villages</div>
          </div>
        </div>
      )}

      {/* Key Gaps Progress Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          District Baseline Gap Breakdown
        </h3>

        <div className="space-y-4">
          {gaps.map(gap => (
            <div key={gap.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-800">{gap.name}</span>
                <span className="text-slate-900 font-extrabold">{gap.value}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${gap.statusType === 'positive' ? 'bg-emerald-600' : 'bg-amber-500'}`} 
                  style={{ width: `${gap.value}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
