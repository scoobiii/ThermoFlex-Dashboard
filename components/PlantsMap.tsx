import React, { useMemo } from 'react';
import DashboardCard from './DashboardCard';
import { MapPinIcon } from './icons';
import { Plant } from '../types';

interface PlantsMapProps {
  selectedPlant: Plant | undefined;
}

const PlantsMap: React.FC<PlantsMapProps> = ({ selectedPlant }) => {
  const mapEmbedUrl = useMemo(() => {
    const baseMapUrl = "https://www.google.com/maps/d/embed?mid=1hTRtS-GB3L-tG6_Spv2ce1E2Twv1_A0&ehbc=2E312F";
    // Default view centered on Southeast Brazil
    let finalUrl = `${baseMapUrl}&ll=-22.95,-44.85&z=7`; 

    if (selectedPlant && selectedPlant.coordinates && selectedPlant.coordinates.lat !== 0) {
      const { lat, lng } = selectedPlant.coordinates;
      finalUrl = `${baseMapUrl}&ll=${lat},${lng}&z=12`;
    }
    return finalUrl;
  }, [selectedPlant]);

  return (
    <DashboardCard title="Mapa das Usinas" icon={<MapPinIcon className="w-6 h-6" />}>
      <div className="w-full h-full min-h-[420px] bg-gray-700 rounded-lg overflow-hidden">
        <iframe
          key={mapEmbedUrl} // Use a key to force iframe re-render on src change
          src={mapEmbedUrl}
          title="Mapa das Usinas de Energia"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </DashboardCard>
  );
};

export default PlantsMap;