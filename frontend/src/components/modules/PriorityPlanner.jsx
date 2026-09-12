import React, { useState, useEffect } from 'react';
import { useLocation } from '../../context/LocationContext';
import { fetchPriorities } from '../../api/priorities';
import { LoadingSkeleton } from '../common/LoadingSkeleton';
import { ErrorMessage } from '../common/ErrorMessage';
import { ArrowRight } from 'lucide-react';

export const PriorityPlanner = () => {
  const { selectedDistrictId, setSelectedVillageId, setActiveTab } = useLocation();
  const [filter, setFilter] = useState('ALL');
  const [priorityVillages, setPriorityVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPriorities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPriorities(selectedDistrictId, filter);
      const list = Array.isArray(res) ? res : (res?.data || []);
      setPriorityVillages(list);
    } catch (err) {
      setError(err.message || 'Failed to load priorities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, [selectedDistrictId, filter]);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Where should resources go first?
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            Resource Priority Ranking Table • Direct decision-support allocation
          </p>
        </div>

        {/* Filters: All | Critical | High | Moderate */}
        <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-2xs">
          {['ALL', 'CRITICAL', 'HIGH', 'MODERATE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {f === 'ALL' ? 'All Villages' : f}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadPriorities} />}

      {/* Ranking Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton type="table" count={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Village</th>
                  <th className="py-3 px-4">Risk Score</th>
                  <th className="py-3 px-4">Main Gap</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {priorityVillages.map((v, index) => {
                  const rankNum = String(v.rank || (index + 1)).padStart(2, '0');
                  const vId = v.id || v.villageId || v._id;
                  const vName = v.name || v.village || 'Village';
                  const vBlock = v.block || 'Block';
                  const vDistrict = v.districtName || v.district || 'District';
                  const vScore = v.riskScore ?? v.priorityScore ?? 0;
                  const vGap = v.topGap || v.mainGap || (typeof v.healthcareGap === 'number' ? `Gap Index: ${v.healthcareGap}` : v.healthcareGap) || 'Operational Assessment';
                  const vRisk = v.riskLevel || v.priority || 'Moderate';
                  const isCritical = String(vRisk).toLowerCase() === 'critical';
                  const isHigh = String(vRisk).toLowerCase() === 'high';

                  return (
                    <tr 
                      key={vId || index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-black text-slate-400">
                        {rankNum}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">{vName}</div>
                        <div className="text-[11px] text-slate-500">{vBlock} Block • {vDistrict}</div>
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                        {vScore} <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {vGap}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          isCritical 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : isHigh 
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {vRisk}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            if (vId) setSelectedVillageId(vId);
                            setActiveTab('village');
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                        >
                          <span>View Intelligence</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
