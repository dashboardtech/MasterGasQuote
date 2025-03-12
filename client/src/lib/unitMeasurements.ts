// Standard unit measurements for different component types
export const unitMeasurements = [
  { value: 'm', label: 'Meters (m)' },
  { value: 'm²', label: 'Square Meters (m²)' },
  { value: 'm³', label: 'Cubic Meters (m³)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'kg', label: 'Kilograms (kg)' },
  { value: 'l', label: 'Liters (l)' },
  { value: 'gal', label: 'Gallons (gal)' },
  { value: 'unit', label: 'Unit (each)' }
];

// Default unit measurements per component type
export const defaultUnitMeasurementsByType = {
  tank: 'gal',
  dispenser: 'unit',
  soil: 'm³',
  concrete: 'm²',
  administrative: 'm²',
  electrical: 'unit',
  canopy: 'm²',
  piping: 'm',
  excavation: 'm³',
  sensors: 'unit',
  wiring: 'm'
};

// Function to get the recommended unit measurements for a specific component type
export function getRecommendedUnitsForType(type: string): string[] {
  switch (type) {
    case 'tank':
      return ['gal', 'l'];
    case 'dispenser':
      return ['unit'];
    case 'soil':
    case 'excavation':
      return ['m³'];
    case 'concrete':
    case 'administrative':
    case 'canopy':
      return ['m²'];
    case 'piping':
    case 'wiring':
      return ['m'];
    case 'sensors':
    case 'electrical':
      return ['unit'];
    default:
      return ['unit'];
  }
}

// Function to get a list of unit measurement options filtered by component type
export function getUnitMeasurementOptions(componentType: string) {
  const recommendedUnits = getRecommendedUnitsForType(componentType);
  
  // First add the recommended units in order
  const recommendedOptions = recommendedUnits.map(unit => 
    unitMeasurements.find(measurement => measurement.value === unit)
  ).filter(Boolean);
  
  // Then add the other options
  const otherOptions = unitMeasurements.filter(
    measurement => !recommendedUnits.includes(measurement.value)
  );
  
  return [...recommendedOptions, ...otherOptions];
}