import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import L from 'leaflet';
import { MapPin, Info, ArrowRight, AlertTriangle } from 'lucide-react';

export const InteractiveRiskMap = () => {
  const { 
    filteredVillages, 
    setSelectedVillageId, 
    setActiveTab, 
    currentDistrict 
  } = useLocation();

  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [mapSelectedVillage, setMapSelectedVillage] = useState(filteredVillages[0] || null);

  useEffect(() => {
    if (filteredVillages.length > 0) {
      if (!mapSelectedVillage || !filteredVillages.some(v => (v.id || v._id) === (mapSelectedVillage.id || mapSelectedVillage._id))) {
        setMapSelectedVillage(filteredVillages[0]);
      }
    }
  }, [filteredVillages]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletMapRef.current) {
      const map = L.map(mapRef.current, {
        center: [23.344, 85.309],
        zoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;

      // Invalidate size to ensure clean tile rendering
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !markersGroupRef.current) return;

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    if (filteredVillages.length === 0) return;

    const bounds = L.latLngBounds([]);

    filteredVillages.forEach((village) => {
      const vId = village.id || village.villageId || village._id;
      const vName = village.name || village.village || 'Village';
      const vBlock = village.block || (currentDistrict?.name || 'District');
      const lat = village.lat ?? village.latitude ?? village.coordinates?.latitude;
      const lng = village.lng ?? village.longitude ?? village.coordinates?.longitude;

      if (!lat || !lng) return;

      bounds.extend([lat, lng]);

      const riskLevel = village.riskLevel || (village.risk?.riskLevel) || 'Moderate';
      const riskScore = village.riskScore ?? village.risk?.riskScore ?? 50;
      const hesScore = village.scores?.hes ?? village.healthcareEffectiveness?.healthcareEffectivenessScore ?? village.hesScore ?? 50;
      const topGap = village.topGap ?? village.mainGap ?? village.healthcareGap?.mainGap ?? 'Monitoring required';

      const isCritical = riskLevel.toLowerCase() === 'critical';
      const isHigh = riskLevel.toLowerCase() === 'high';
      const isModerate = riskLevel.toLowerCase() === 'moderate';

      const colorClass = isCritical ? '#dc2626' : isHigh ? '#ea580c' : isModerate ? '#d97706' : '#16a34a';

      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isCritical ? `<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(220, 38, 38, 0.25); animation: ping 1.8s infinite;"></div>` : ''}
            <div style="width: 18px; height: 18px; border-radius: 50%; background: ${colorClass}; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      const popupContent = `
        <div style="font-family: inherit; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <strong style="color: #0f172a; font-size: 14px;">${vName}</strong>
            <span style="background: #fef2f2; color: ${colorClass}; font-weight: 800; font-size: 11px; padding: 2px 6px; border-radius: 4px; border: 1px solid ${colorClass};">
              ${riskLevel} Risk (${riskScore})
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px;">
            HES Score: <strong style="color: #16a34a;">${hesScore}/100</strong> | Block: ${vBlock}
          </div>
          <div style="font-size: 11px; color: #991b1b; margin-bottom: 10px;">
            ⚠️ Top Gap: ${topGap}
          </div>
          <button 
            id="popup-btn-${vId}" 
            style="width: 100%; background: #16a34a; color: white; border: none; border-radius: 6px; padding: 7px 10px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
          >
            View Village Intelligence →
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        setMapSelectedVillage(village);
        setSelectedVillageId(vId);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${vId}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedVillageId(vId);
            setActiveTab('village');
          };
        }
      });

      markersGroup.addLayer(marker);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    }
  }, [filteredVillages, setSelectedVillageId, setActiveTab, currentDistrict]);

  return (
    <div className="space-y-4 pb-10">
      
      {/* Map Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Rural Healthcare Risk Map: <span className="text-emerald-700">{currentDistrict.name} District</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">({filteredVillages.length} Villages Rendered)</span>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-600"></span>
            <span className="text-red-700">Critical Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-orange-600"></span>
            <span className="text-orange-700">High Risk</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-amber-700">Moderate</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
            <span className="text-emerald-700">Low Risk</span>
          </div>
        </div>
      </div>

      {/* Main Map Container & Side Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Leaflet Map (3 Cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-2 h-[520px] relative overflow-hidden shadow-xs">
          <div ref={mapRef} className="w-full h-full rounded-lg z-10"></div>
        </div>

        {/* Selected Village Preview Drawer Card (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xs">
          {mapSelectedVillage ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Selected Map Node</span>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                  <span>{mapSelectedVillage.name || mapSelectedVillage.village || 'Village'}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    (mapSelectedVillage.riskLevel || '').toLowerCase() === 'critical' ? 'bg-red-50 text-red-700 border-red-200' :
                    (mapSelectedVillage.riskLevel || '').toLowerCase() === 'high' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {mapSelectedVillage.riskLevel || mapSelectedVillage.risk?.riskLevel || 'Moderate'} Risk
                  </span>
                </h4>
                <p className="text-xs text-slate-500">
                  {mapSelectedVillage.block || (currentDistrict?.name || 'District')} Block • {(mapSelectedVillage.population ?? mapSelectedVillage.village?.population ?? 0).toLocaleString()} Population
                </p>
              </div>

              {/* HES Score Gauge Box */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Healthcare Effectiveness</span>
                  <span className="text-emerald-700 font-bold">
                    {mapSelectedVillage.scores?.hes ?? mapSelectedVillage.healthcareEffectiveness?.healthcareEffectivenessScore ?? mapSelectedVillage.hesScore ?? 50}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${mapSelectedVillage.scores?.hes ?? mapSelectedVillage.healthcareEffectiveness?.healthcareEffectivenessScore ?? mapSelectedVillage.hesScore ?? 50}%` }}
                  ></div>
                </div>
              </div>

              {/* Bottleneck Callout */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold text-amber-800 flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Primary Bottleneck</span>
                </div>
                <p>{mapSelectedVillage.topGap ?? mapSelectedVillage.mainGap ?? mapSelectedVillage.healthcareGap?.mainGap ?? 'Monitoring required'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select a village pin on the map to preview details.
            </div>
          )}

          {mapSelectedVillage && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => {
                  const targetId = mapSelectedVillage.id || mapSelectedVillage.villageId || mapSelectedVillage._id;
                  setSelectedVillageId(targetId);
                  setActiveTab('village');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-2xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>View Village Intelligence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
