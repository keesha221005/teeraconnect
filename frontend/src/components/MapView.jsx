import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../context/LanguageContext';

export default function MapView({ zones = [], centerLat, centerLng, activeLocationName }) {
  const { t } = useLanguage();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false // We will position it bottom-right for clean mobile layout
      }).setView([centerLat, centerLng], 9);

      // Add modern style light tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);

      // Re-position zoom buttons to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

      // Create overlay group for markers
      markersGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update map view (pan & zoom) when center coordinates shift
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([centerLat, centerLng], 10, { animate: true, duration: 1 });
    }
  }, [centerLat, centerLng]);

  // Redraw Markers whenever zones change
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    // Clear existing markers
    markersGroupRef.current.clearLayers();

    // Map status colors to Tailwind colors
    const statusColors = {
      safe: { color: '#10B981', ringColor: '#A7F3D0' },      // Green
      warning: { color: '#F59E0B', ringColor: '#FDE68A' },   // Orange
      danger: { color: '#EF4444', ringColor: '#FCA5A5' }     // Red
    };

    zones.forEach((zone) => {
      const config = statusColors[zone.status] || statusColors.safe;

      // Custom pulsing HTML marker
      const customIcon = L.divIcon({
        className: 'custom-gps-marker',
        html: `
          <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: ${config.color}; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${config.color}; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); z-index: 10;"></div>
          </div>
          <style>
            @keyframes ping {
              75%, 100% { transform: scale(2); opacity: 0; }
            }
          </style>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Construct popup HTML
      const popupHtml = `
        <div style="font-family: 'Outfit', sans-serif; padding: 4px; min-width: 160px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #1C1917;">${zone.name}</h4>
          <span style="display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: bold; border-radius: 4px; text-transform: uppercase; margin-bottom: 8px; 
            background-color: ${zone.status === 'safe' ? '#D1FAE5' : zone.status === 'warning' ? '#FEF3C7' : '#FEE2E2'};
            color: ${zone.status === 'safe' ? '#065F46' : zone.status === 'warning' ? '#92400E' : '#991B1B'};">
            ${zone.status.toUpperCase()}
          </span>
          <p style="margin: 0; font-size: 12px; color: #57534E; font-weight: 500; line-height: 1.4;">${zone.notes}</p>
        </div>
      `;

      // Place marker on map
      L.marker([zone.lat, zone.lng], { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(markersGroupRef.current);
    });

    // Also draw a special blue pin for the active port center itself
    const activePortIcon = L.divIcon({
      className: 'active-port-marker',
      html: `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: #0E7C86; opacity: 0.2; animation: ping 2s infinite;"></div>
          <div style="width: 16px; height: 16px; border-radius: 50%; background-color: #0E7C86; border: 3px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); z-index: 20;"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([centerLat, centerLng], { icon: activePortIcon })
      .bindPopup(`<strong style="font-family: 'Outfit'; color:#0E7C86; font-size: 13px;">${activeLocationName}</strong>`)
      .addTo(markersGroupRef.current);

  }, [zones, centerLat, centerLng, activeLocationName]);

  return (
    <div className="space-y-3">
      <div className="px-1 flex justify-between items-center">
        <h3 className="text-xl font-bold tracking-tight text-stone-800">{t('mapTitle')}</h3>
      </div>
      
      {/* Map Element Container */}
      <div className="w-full h-[320px] md:h-[400px] shadow-inner relative overflow-hidden rounded-2xl border-2 border-stone-200">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      <div className="bg-stone-100 border border-stone-200 rounded-xl p-3 text-center text-xs font-bold text-stone-600">
        {t('zonesLegend')}
      </div>
    </div>
  );
}
