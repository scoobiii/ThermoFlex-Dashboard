import React, { useEffect, useState } from 'react';
import { PlantStatus } from '../types';
import WasteHeatRecovery from '../components/Utilities/WasteHeatRecovery';
import AbsorptionChiller from '../components/Utilities/AbsorptionChiller';
import CoolingDistribution from '../components/Utilities/CoolingDistribution';
import FlowArrow from '../components/Utilities/FlowArrow';

interface UtilitiesProps {
    powerOutput: number;
    efficiency: number;
    plantStatus: PlantStatus;
    setEfficiencyGain: (gain: number) => void;
}

const Utilities: React.FC<UtilitiesProps> = ({ powerOutput, efficiency, plantStatus, setEfficiencyGain }) => {
    
    const isOnline = plantStatus === PlantStatus.Online;
    const [ambientTemp] = useState(32.4); // Simulate ambient temperature for ISO condition check

    // Calculate waste heat based on power output and efficiency
    // Power Input = Power Output / Efficiency
    // Waste Heat = Power Input - Power Output = Power Output * (1/Efficiency - 1)
    const powerInput = isOnline && efficiency > 0 ? powerOutput / (efficiency / 100) : 0;
    const wasteHeat = isOnline ? powerInput - powerOutput : 0;
    
    // Calculate cooling production based on waste heat and chiller's COP
    // Adjusted COP to align simulation with target values (~1108 MW total cooling)
    const chillerCOP = 0.694; // Typical Coefficient of Performance for a single-effect absorption chiller
    const coolingProduction = isOnline ? wasteHeat * chillerCOP : 0;

    // Distribute cooling power: 40% to TIAC, 30% to Fog, 30% to Data Center
    const tiacCooling = coolingProduction * 0.4;
    const fogCooling = coolingProduction * 0.3;
    const dataCenterCooling = coolingProduction * 0.3;

    useEffect(() => {
        const ISO_TEMP_THRESHOLD = 25; // Define ISO condition threshold
        if (isOnline && ambientTemp > ISO_TEMP_THRESHOLD) {
            // Efficiency gain is now proportional to the cooling power applied.
            // This dynamically represents the benefit of converting waste heat into useful cooling.
            // Factors are chosen to keep the gain in a realistic range (~2-3%).
            const tiacGain = tiacCooling / 300; // Roughly 1% gain per 300 MW of TIAC cooling
            const fogGain = fogCooling / 400;  // Roughly 1% gain per 400 MW of Fog system cooling
            setEfficiencyGain(tiacGain + fogGain);
        } else {
            setEfficiencyGain(0);
        }
    }, [isOnline, ambientTemp, tiacCooling, fogCooling, setEfficiencyGain]);


    return (
        <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
                
                {/* Waste Heat Recovery Card */}
                <div className="lg:col-span-3">
                    <WasteHeatRecovery wasteHeat={wasteHeat} isOnline={isOnline} />
                </div>
                
                {/* Arrow 1 */}
                <div className="lg:col-span-1">
                    <FlowArrow />
                </div>

                {/* Absorption Chiller Card */}
                <div className="lg:col-span-3">
                    <AbsorptionChiller coolingProduction={coolingProduction} isOnline={isOnline} />
                </div>

                {/* Arrow 2 */}
                <div className="lg:col-span-1">
                    <FlowArrow />
                </div>

                {/* Cooling Distribution Card */}
                <div className="lg:col-span-3">
                    <CoolingDistribution 
                        coolingProduction={coolingProduction} 
                        isOnline={isOnline}
                        tiacCooling={tiacCooling}
                        fogCooling={fogCooling}
                        dataCenterCooling={dataCenterCooling}
                    />
                </div>

            </div>
        </div>
    );
};

export default Utilities;