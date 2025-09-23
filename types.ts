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
  history?: { rpm: number; temp: number; pressure: number }[];
  needsMaintenance?: boolean;
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
  type: 'standard' | 'upgrade' | 'new';
  power: number; // in MW
  fuel: string;
  location: string;
  conversion?: number; // percentage
  ethanolDemand?: number; // m³/h
  status: 'standard' | 'Existente' | 'Proposta';
  coordinates: { lat: number; lng: number };
  description: string;
}