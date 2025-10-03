import React, { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';
import { BoltIcon } from './icons';

interface PowerConsumptionProps {
  t: (key: string) => string;
}

const PowerConsumption: React.FC<PowerConsumptionProps> = ({ t }) => {
  const [pue, setPue] = useState(1.05);
  const [itLoad, setItLoad] = useState(485); // kW
  const [totalLoad, setTotalLoad] = useState(510); // kW

  useEffect(() => {
    const interval = setInterval(() => {
      const newItLoad = Math.max(450, Math.min(500, itLoad + (Math.random() - 0.5) * 10));
      const coolingLoad = newItLoad * 0.05; // Simplified cooling load
      const otherLoads = 5; // Simplified other loads
      const newTotalLoad = newItLoad + coolingLoad + otherLoads;
      const newPue = newTotalLoad / newItLoad;

      setPue(newPue);
      setItLoad(newItLoad);
      setTotalLoad(newTotalLoad);
    }, 2500);

    return () => clearInterval(interval);
  }, [itLoad]);

  return (
    <DashboardCard title={t('dataCenter.powerConsumptionTitle')} icon={<BoltIcon className="w-6 h-6 text-yellow-400" />}>
      <div className="flex flex-col justify-around h-full text-center">
        <div>
          <p className="text-gray-400 text-sm">{t('dataCenter.pue')}</p>
          <p className="text-4xl font-bold text-green-400 tracking-tight">{pue.toFixed(3)}</p>
        </div>
        <div className="flex justify-around text-sm">
          <div>
            <p className="text-gray-400">{t('dataCenter.itLoad')}</p>
            <p className="font-mono text-lg font-semibold">{itLoad.toFixed(1)} kW</p>
          </div>
          <div className="w-px bg-gray-700"></div>
          <div>
            <p className="text-gray-400">{t('dataCenter.totalLoad')}</p>
            <p className="font-mono text-lg font-semibold">{totalLoad.toFixed(1)} kW</p>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
};

export default PowerConsumption;
