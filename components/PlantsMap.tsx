import React from 'react';
import DashboardCard from './DashboardCard';
import { MapPinIcon } from './icons';

const PlantsMap: React.FC = () => {
  // This URL points to a public Google My Maps with the locations from data/plants.ts plotted.
  // The map has two layers: 'Existente' (blue) and 'Proposta' (red).
  // The background color is set via URL parameter to match the app's dark theme.
  const mapEmbedUrl = "https://www.google.com/maps/d/embed?mid=1hTRtS-GB3L-tG6_Spv2ce1E2Twv1_A0&ehbc=2E312F";

  return (
    <DashboardCard title="Mapa das Usinas" icon={<MapPinIcon className="w-6 h-6" />}>
      <div className="w-full h-full min-h-[420px] bg-gray-700 rounded-lg overflow-hidden">
        <iframe
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
