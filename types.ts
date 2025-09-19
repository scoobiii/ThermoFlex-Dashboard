
export enum PlantStatus {
  Online = 'Online',
  Offline = 'Offline',
  Maintenance = 'Manutenção',
}

export enum FuelMode {
  NaturalGas = '100% Gás Natural',
  Ethanol = '100% Etanol',
  Biodiesel = '100% Biodiesel',
  FlexNGH2 = 'Flex GN/H2',
  FlexEthanolBiodiesel = 'Flex Etanol/Biodiesel',
}

export interface EmissionData {
  nox: number; // Dióxido de Nitrogênio
  sox: number; // Dióxido de Enxofre
  co: number;  // Monóxido de Carbono
  particulates: number; // Material Particulado
}

export interface HistoricalDataPoint {
  time: string;
  power: number;
}

export interface LongHistoricalDataPoint {
  time: string;
  power: number;
  consumption: number;
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface Turbine {
    id: number;
    status: 'active' | 'inactive' | 'error';
    rpm: number;
    temp: number;
    pressure: number;
}

export interface HistoricalEmissionPoint {
  time: string;
  nox: number;
  sox: number;
  co: number;
  particulates: number;
}
