export enum PlantStatus {
  Online = 'Online',
  Offline = 'Offline',
  Maintenance = 'Manutenção',
}

export enum FuelMode {
  NaturalGas = 'Gás Natural',
  Ethanol = 'Etanol',
  Biodiesel = 'Biodiesel',
  FlexNGH2 = 'Flex (GN/H2)',
  FlexEthanolBiodiesel = 'Flex (Etanol/Biodiesel)',
  Nuclear = 'Nuclear',
}

export interface HistoricalDataPoint {
  time: string;
  power: number;
}

export interface EmissionData {
  nox: number;
  sox: number;
  co: number;
  particulates: number;
}

export interface HistoricalEmissionPoint extends EmissionData {
  time: string;
}

export type TurbineStatus = 'active' | 'inactive' | 'error';

export interface Turbine {
  id: number;
  status: TurbineStatus;
  rpm: number;
  temp: number;
  pressure: number;
  type: 'Ciclo Rankine' | 'Ciclo Combinado';
  manufacturer: string;
  model: string;
  isoCapacity: number; // in MW
  history?: { time: string; rpm: number; temp: number; pressure: number }[];
  maintenanceScore: number; // Replaces needsMaintenance
}

export interface Alert {
  id: number;
  level: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
}

export interface LongHistoricalDataPoint {
  time: string;
  power: number;
  consumption: number;
}

export interface Plant {
  name: string;
  power: number; // capacity in MW
  fuel: string;

  // Fields for custom projects from original data/plants.ts
  type?: 'standard' | 'upgrade' | 'new';
  status?: 'standard' | 'Existente' | 'Proposta';
  description?: string;
  conversion?: number; // percentage
  ethanolDemand?: number; // m³/h
  coordinates?: { lat: number; lng: number };
  identifier?: {
    type: 'location' | 'license';
    value: string;
  };

  // Fields for real UTEs from national inventory
  location?: string;
  cycle?: string; // 'Ciclo Combinado', etc.
  generation2023?: number | null; // GWh
  emissions2023?: number | null; // mil tCO₂e
  efficiency?: number | null; // %
  rate?: number | null; // tCO₂e/GWh
}