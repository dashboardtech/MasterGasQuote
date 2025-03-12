import { ComponentType } from "./types";

// Standard component types available for selection
export const componentTypes = [
  {
    id: 'tank',
    name: 'Fuel Tank',
    icon: 'fas fa-gas-pump',
    description: 'Underground storage tanks for fuel'
  },
  {
    id: 'dispenser',
    name: 'Dispenser',
    icon: 'fas fa-charging-station',
    description: 'Fuel dispensers for customer use'
  },
  {
    id: 'soil',
    name: 'Soil Extraction',
    icon: 'fas fa-truck-pickup',
    description: 'Excavation and disposal of soil'
  },
  {
    id: 'concrete',
    name: 'Concrete Application',
    icon: 'fas fa-layer-group',
    description: 'Concrete for foundations and surfaces'
  },
  {
    id: 'administrative',
    name: 'Administrative Building',
    icon: 'fas fa-building',
    description: 'Office, convenience store, and amenities'
  },
  {
    id: 'electrical',
    name: 'Electrical Systems',
    icon: 'fas fa-bolt',
    description: 'Power distribution and lighting'
  },
  {
    id: 'canopy',
    name: 'Canopy',
    icon: 'fas fa-umbrella',
    description: 'Overhead coverage for fuel dispensers'
  }
];

// Fuel tank options
export const tankCapacities = [
  { value: '10000', label: '10,000 gallons' },
  { value: '15000', label: '15,000 gallons' },
  { value: '20000', label: '20,000 gallons' },
  { value: '25000', label: '25,000 gallons' },
  { value: '30000', label: '30,000 gallons' }
];

export const tankMaterials = [
  { value: 'fiberglass', label: 'Fiberglass' },
  { value: 'steel', label: 'Steel' },
  { value: 'doubleFiberglass', label: 'Double-Wall Fiberglass' },
  { value: 'doubleSteel', label: 'Double-Wall Steel' }
];

// Dispenser options
export const dispenserModels = [
  { value: 'standard', label: 'Standard', unitCost: 8000 },
  { value: 'premium', label: 'Premium', unitCost: 12000 },
  { value: 'ultra', label: 'Ultra', unitCost: 15000 }
];

// Default unit costs
export const defaultUnitCosts = {
  tank: {
    '10000': 24500,
    '15000': 32000,
    '20000': 42000,
    '25000': 51000,
    '30000': 61000
  },
  dispenser: {
    'standard': 8000,
    'premium': 12000,
    'ultra': 15000
  },
  soil: 85, // per cubic meter
  concrete: 120, // per square meter
  administrative: 1500, // per square meter
  electrical: 15000, // base price
  canopy: 35000 // base price
};

// Calculate tank volume in cubic meters for soil extraction calculations
export function calculateTankVolume(capacity: string, quantity: number): number {
  // Convert gallons to cubic meters
  // 1 US gallon = 0.00378541 cubic meters
  const gallonsToMetersCubedFactor = 0.00378541;
  const capacityValue = parseInt(capacity);
  
  // Add 20% for excavation space around the tank
  const totalVolume = capacityValue * gallonsToMetersCubedFactor * quantity * 1.2;
  
  // Round to nearest whole number
  return Math.round(totalVolume);
}

// Function to get default component templates for quick creation
export function getComponentTemplate(type: ComponentType) {
  switch (type) {
    case 'tank':
      return {
        type: 'tank',
        name: 'Underground Storage Tank',
        description: 'Double-wall fiberglass construction',
        configuration: {
          capacity: '10000',
          material: 'doubleFiberglass'
        },
        quantity: 1,
        unitCost: defaultUnitCosts.tank['10000'],
        totalCost: defaultUnitCosts.tank['10000']
      };
    
    case 'dispenser':
      return {
        type: 'dispenser',
        name: 'High-Speed Dispenser',
        description: 'Multi-product, 4 hoses per unit',
        configuration: {
          model: 'standard',
          hoses: 4
        },
        quantity: 1,
        unitCost: defaultUnitCosts.dispenser['standard'],
        totalCost: defaultUnitCosts.dispenser['standard']
      };
      
    case 'soil':
      return {
        type: 'soil',
        name: 'Soil Extraction',
        description: 'Including transportation and disposal',
        configuration: {
          volume: 240,
          unitMeasurement: 'm³'
        },
        quantity: 1,
        unitCost: defaultUnitCosts.soil,
        totalCost: 240 * defaultUnitCosts.soil
      };
      
    case 'concrete':
      return {
        type: 'concrete',
        name: 'Concrete Application',
        description: 'High-strength, reinforced concrete',
        configuration: {
          area: 450,
          unitMeasurement: 'm²',
          thickness: 0.15
        },
        quantity: 1,
        unitCost: defaultUnitCosts.concrete,
        totalCost: 450 * defaultUnitCosts.concrete
      };
      
    case 'administrative':
      return {
        type: 'administrative',
        name: 'Administrative Building',
        description: 'Including office space and customer facilities',
        configuration: {
          size: 200,
          unitMeasurement: 'm²',
          type: 'retail'
        },
        quantity: 1,
        unitCost: defaultUnitCosts.administrative,
        totalCost: 200 * defaultUnitCosts.administrative
      };
      
    case 'electrical':
      return {
        type: 'electrical',
        name: 'Electrical Systems',
        description: 'Power distribution and lighting',
        configuration: {},
        quantity: 1,
        unitCost: defaultUnitCosts.electrical,
        totalCost: defaultUnitCosts.electrical
      };
      
    case 'canopy':
      return {
        type: 'canopy',
        name: 'Fuel Dispenser Canopy',
        description: 'Weather protection with integrated lighting',
        configuration: {},
        quantity: 1,
        unitCost: defaultUnitCosts.canopy,
        totalCost: defaultUnitCosts.canopy
      };
      
    default:
      throw new Error(`Unknown component type: ${type}`);
  }
}
