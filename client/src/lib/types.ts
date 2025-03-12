import { ComponentConfiguration, ManpowerRequirement } from "@shared/schema";

export interface QuoteFormData {
  name: string;
  client: string;
  location: string;
  completionDate: string;
  notes?: string;
}

export type ComponentType = 'tank' | 'dispenser' | 'soil' | 'concrete' | 'administrative' | 'electrical' | 'canopy' | 'piping' | 'excavation' | 'sensors' | 'wiring';

export interface ComponentFormData {
  quoteId: number;
  type: ComponentType;
  name: string;
  description?: string;
  configuration: ComponentConfiguration;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface StepperStep {
  id: number;
  name: string;
  status: 'upcoming' | 'active' | 'complete';
}

export interface FuelTank {
  id: string;
  capacity: string;
  quantity: number;
  unitCost: number;
}

export interface Dispenser {
  id: string;
  model: string;
  quantity: number;
  unitCost: number;
}

export interface SoilExtraction {
  volume: number;
  unitCost: number;
}

export interface ConcreteApplication {
  area: number;
  unitCost: number;
}

export interface AdministrativeBuilding {
  size: number;
  unitCost: number;
}

export interface QuoteSummary {
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
}

export interface ManpowerRole {
  id: string;
  name: string;
  description?: string;
  defaultRate: number;
}

export interface ManpowerCostSummary {
  totalHours: number;
  totalCost: number;
  laborCostByRole: {
    [role: string]: {
      hours: number;
      cost: number;
    };
  };
}
