import React from 'react';
import DashboardCard from './DashboardCard';
import { InfoIcon } from './icons';

interface NuclearPlantInfoProps {
  isMaximizable?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const NuclearPlantInfo: React.FC<NuclearPlantInfoProps> = ({
  isMaximizable,
  isMaximized,
  onToggleMaximize,
}) => {
  return (
    <DashboardCard
      title="Status de Emissões (Operação)"
      icon={<InfoIcon className="w-6 h-6 text-green-400" />}
      isMaximizable={isMaximizable}
      isMaximized={isMaximized}
      onToggleMaximize={onToggleMaximize}
      className="h-full"
    >
      <div className="flex flex-col h-full justify-center items-center text-center">
        <div className="p-4 bg-green-900/50 border-l-4 border-green-400 rounded-r-lg">
            <h3 className="text-xl font-bold text-green-400">
                Operação com Zero Emissão de GEE
            </h3>
            <p className="mt-2 text-gray-300">
                Usinas nucleares não emitem gases de efeito estufa (GEE) como CO₂, NOx ou SOx durante a geração de eletricidade. A energia é produzida através da fissão nuclear, um processo limpo em termos de emissões atmosféricas.
            </p>
        </div>
        <div className="mt-6 text-sm text-gray-400">
            <h4 className="font-semibold text-gray-200 mb-2">Gestão de Resíduos</h4>
            <p>
                O combustível utilizado é gerenciado de forma segura em instalações de armazenamento temporário e permanente, seguindo rigorosos protocolos internacionais de segurança para isolar os materiais do meio ambiente.
            </p>
        </div>
      </div>
    </DashboardCard>
  );
};

export default NuclearPlantInfo;
