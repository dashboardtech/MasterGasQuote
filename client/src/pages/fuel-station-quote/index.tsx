import React, { useState, useEffect } from 'react';
import { 
  getComponentTypes,
  getComponentsByType, 
  getComponentDependencies,
  getAllUnitConversions
} from '../../api/fuel-station-api';
import type { 
  FuelStationComponent, 
  UnitConversion,
  SoilMovementCalculation,
  TankPumpAssignment,
  TankSpecifications,
  PumpSpecifications,
  PipingSpecifications,
  ValveSpecifications,
  ElectricalSpecifications,
  ExcavationSpecifications,
  ComponentDependency
} from '@shared/fuel-station-schema';
import { 
  calculateSoilMovement, 
  assignPumpsToTanks, 
  calculateDependencies,
  convertUnit,
  calculateTotalCost
} from '../../lib/fuel-station-calculations';

interface SelectedComponent {
  component: FuelStationComponent;
  quantity: number;
}

interface DependencyItem {
  component: FuelStationComponent;
  quantity: number;
  required: boolean;
}

// Debug information to stderr
const logDebug = (message: string) => {
  console.error(`[DEBUG] ${message}`);
};

export default function FuelStationQuote() {
  // Add global styles to improve overall formatting
  React.useEffect(() => {
    document.body.classList.add('bg-gray-100');
    return () => {
      document.body.classList.remove('bg-gray-100');
    };
  }, []);

  // State for components and selections
  const [componentTypes, setComponentTypes] = useState<string[]>([]);
  const [availableComponents, setAvailableComponents] = useState<Record<string, FuelStationComponent[]>>({});
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([]);
  const [calculatedDependencies, setCalculatedDependencies] = useState<DependencyItem[]>([]);
  const [unitConversions, setUnitConversions] = useState<UnitConversion[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [tankPumpAssignments, setTankPumpAssignments] = useState<TankPumpAssignment[]>([]);
  const [soilCalculations, setSoilCalculations] = useState<SoilMovementCalculation | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        
        // Fetch component types directly using the new API endpoint
        const types = await getComponentTypes();
        setComponentTypes(types);
        logDebug(`Loaded ${types.length} component types: ${types.join(', ')}`);
        
        // Group components by type
        const componentsByType: Record<string, FuelStationComponent[]> = {};
        
        // Fetch components for each type in parallel
        const typePromises = types.map(async (type) => {
          try {
            const typeComponents = await getComponentsByType(type);
            componentsByType[type] = typeComponents;
            logDebug(`Loaded ${typeComponents.length} components of type: ${type}`);
          } catch (error) {
            logDebug(`Error loading components for type ${type}: ${error instanceof Error ? error.message : String(error)}`);
            componentsByType[type] = [];
          }
        });
        
        await Promise.all(typePromises);
        setAvailableComponents(componentsByType);
        
        // Fetch unit conversions
        const conversions = await getAllUnitConversions();
        setUnitConversions(conversions);
        
        setLoading(false);
      } catch (error) {
        logDebug(`Error loading initial data: ${error instanceof Error ? error.message : String(error)}`);
        setError('Failed to load component data. Please refresh the page and try again.');
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Handle component selection
  const handleSelectComponent = async (component: FuelStationComponent, quantity = 1) => {
    try {
      // Add component to selected components
      const newSelectedComponents = [...selectedComponents, { component, quantity }];
      setSelectedComponents(newSelectedComponents);
      
      // Calculate dependencies for the new component
      const allComponents = Object.values(availableComponents).flat();
      
      // Fetch dependencies from API
      const dependencies = await getComponentDependencies(component.id);
      
      // Map dependencies to actual components with proper type safety
      const typeSafeDependencies: ComponentDependency[] = dependencies.map(dep => ({
        id: dep.id,
        primaryComponentId: dep.primaryComponentId,
        dependentComponentId: dep.dependentComponentId,
        relationshipType: dep.relationshipType as 'requires' | 'recommends',
        calculationFormula: dep.calculationFormula || '',
        createdAt: dep.createdAt || new Date().toISOString(),
        updatedAt: dep.updatedAt || new Date().toISOString()
      }));
      
      const dependencyItems: DependencyItem[] = calculateDependencies(
        component,
        allComponents,
        typeSafeDependencies
      );
      
      setCalculatedDependencies([...calculatedDependencies, ...dependencyItems]);
      
      // Update total cost
      const newTotalCost = calculateTotalCost(newSelectedComponents, [...calculatedDependencies, ...dependencyItems]);
      setTotalCost(newTotalCost);
      
      // Special handling for tanks - calculate soil movement and pump assignments
      if (component.type === 'tank') {
        // Calculate soil movement for the tank
        const soilCalc = calculateSoilMovement(component);
        setSoilCalculations(soilCalc);
        
        // Assign pumps to tanks
        const tanks = newSelectedComponents
          .filter(item => item.component.type === 'tank')
          .map(item => item.component);
        
        const pumps = availableComponents.pump || [];
        
        const assignments = assignPumpsToTanks(
          tanks,
          pumps,
          typeSafeDependencies // Use the already typed dependencies
        );
        
        setTankPumpAssignments(assignments);
      }
    } catch (error) {
      logDebug(`Error selecting component: ${error instanceof Error ? error.message : String(error)}`);
      setError('Failed to calculate dependencies for the selected component.');
    }
  };

  // Handle removing a component
  const handleRemoveComponent = (index: number): void => {
    // Store the component being removed for logging
    const removedComponent = selectedComponents[index];
    
    // Create a new array without the removed component
    const newSelectedComponents: SelectedComponent[] = selectedComponents.filter((_, i) => i !== index);
    setSelectedComponents(newSelectedComponents);
    
    // Recalculate dependencies and cost
    // This is a simplified approach - a real implementation would need to recalculate all dependencies
    const newTotalCost = calculateTotalCost(newSelectedComponents, calculatedDependencies);
    setTotalCost(newTotalCost);
    
    logDebug(`Removed component ${removedComponent.component.name} from quote`);
    
    // If we removed all tank components, clear soil calculations
    if (!newSelectedComponents.some(item => item.component.type === 'tank')) {
      setSoilCalculations(null);
      setTankPumpAssignments([]);
      logDebug('Removed all tanks - cleared soil calculations and pump assignments');
    }
  };

  // Handle changing component quantity
  const handleQuantityChange = (index: number, quantity: number): void => {
    if (quantity < 1) return;
    
    // Make a deep copy to avoid state mutation issues
    const newSelectedComponents: SelectedComponent[] = selectedComponents.map((item, i) => 
      i === index ? { ...item, quantity } : { ...item }
    );
    
    setSelectedComponents(newSelectedComponents);
    
    // Recalculate total cost
    const newTotalCost = calculateTotalCost(newSelectedComponents, calculatedDependencies);
    setTotalCost(newTotalCost);
    
    logDebug(`Updated quantity for component ${newSelectedComponents[index].component.name} to ${quantity}`);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold">Loading component data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  // Parse component specifications for display
  type ComponentSpecs = Partial<
    TankSpecifications | 
    PumpSpecifications | 
    PipingSpecifications | 
    ValveSpecifications | 
    ElectricalSpecifications | 
    ExcavationSpecifications
  >;
  
  const parseSpecifications = (component: FuelStationComponent): ComponentSpecs => {
    try {
      if (typeof component.specifications === 'string') {
        return JSON.parse(component.specifications) as ComponentSpecs;
      } 
      if (component.specifications && typeof component.specifications === 'object') {
        return component.specifications as ComponentSpecs;
      }
      return {};
    } catch (error) {
      logDebug(`Error parsing specifications: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  };
  
  // Helper functions to safely access specification properties
  const getCapacity = (specs: ComponentSpecs): number | undefined => {
    return 'capacity' in specs ? specs.capacity : undefined;
  };
  
  const getUnitOfMeasure = (specs: ComponentSpecs): string | undefined => {
    return 'unitOfMeasure' in specs ? specs.unitOfMeasure : undefined;
  };
  
  const getDimensions = (specs: ComponentSpecs): { length: number; width: number; height: number } | undefined => {
    return 'dimensions' in specs ? specs.dimensions : undefined;
  };
  
  const getMaterial = (specs: ComponentSpecs): string | undefined => {
    return 'material' in specs ? specs.material : undefined;
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-4 text-gray-800 pb-2 border-b border-gray-200">Fuel Station Dynamic Quoting System</h1>
      
      {/* Component Selection Section */}
      <div className="bg-white shadow-sm rounded-lg p-2 mb-2 border border-gray-100">
        <h2 className="text-sm font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Add icon</title>
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Component Selection
        </h2>
        
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-700 mb-2" htmlFor="component-type">
            Select Component Type
          </label>
          <select
            id="component-type"
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition-colors"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="">-- Select Type --</option>
            {componentTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        {selectedType && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
              Available {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}s
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableComponents[selectedType]?.map((component) => {
                const specs = parseSpecifications(component);
                return (
                  <div key={component.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5 bg-white">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-lg text-gray-800">{component.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">{component.description}</p>
                    
                    {/* Display component specifications */}
                    <div className="text-xs mb-4 p-3 bg-gray-50 rounded-md border border-gray-100">
                      {getCapacity(specs) !== undefined && (
                        <div className="flex items-baseline mb-1">
                          <span className="font-medium text-gray-700 mr-1">Capacity:</span> 
                          <span className="text-gray-800 text-xs">{getCapacity(specs)} {getUnitOfMeasure(specs) || 'units'}</span>
                        </div>
                      )}
                      {getDimensions(specs) !== undefined && (() => {
                        const dimensions = getDimensions(specs);
                        return dimensions ? (
                          <div className="flex items-baseline mb-1">
                            <span className="font-medium text-gray-700 mr-1">Dimensions:</span>
                            <span className="text-gray-800 text-xs">{dimensions.length}L × {dimensions.width}W × {dimensions.height}H</span>
                          </div>
                        ) : null;
                      })()}
                      {getMaterial(specs) !== undefined && (
                        <div className="flex items-baseline mb-1">
                          <span className="font-medium text-gray-700 mr-1">Material:</span>
                          <span className="text-gray-800 text-xs">{getMaterial(specs)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-auto">
                      <div className="font-semibold text-lg text-gray-900">{formatCurrency(component.price)}</div>
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                        onClick={() => handleSelectComponent(component)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <title>Add component</title>
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Selected Components Section */}
      <div className="bg-white shadow-sm rounded-lg p-2 mb-2 border border-gray-100">
        <h2 className="text-sm font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
            <title>Selected components</title>
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Selected Components
        </h2>
        
        {selectedComponents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
              <title>Empty selection</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500 text-lg">No components selected yet.</p>
            <p className="text-gray-400 text-xs mt-2">Use the component selection panel above to add items to your quote.</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="py-2 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th scope="col" className="py-2 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="py-2 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {selectedComponents.map((item, index) => (
                  <tr key={`${item.component.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-medium text-gray-900 whitespace-nowrap">{item.component.name}</td>
                    <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {item.component.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600 whitespace-nowrap">
                      <div className="flex justify-center items-center">
                        <button
                          type="button"
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-1.5 py-0.5 rounded-l-md transition-colors"
                          onClick={() => item.quantity > 1 && handleQuantityChange(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <span className="font-medium text-xs">−</span>
                        </button>
                        <span className="px-3 py-0.5 border-t border-b border-gray-300 min-w-[32px] text-center bg-white text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-1.5 py-0.5 rounded-r-md transition-colors"
                          onClick={() => handleQuantityChange(index, item.quantity + 1)}
                        >
                          <span className="font-medium text-xs">+</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium text-right whitespace-nowrap">{formatCurrency(item.component.price)}</td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium text-right whitespace-nowrap">{formatCurrency(item.component.price * item.quantity)}</td>
                    <td className="py-2 px-3 text-xs text-center whitespace-nowrap">
                      <button
                        type="button"
                        className="inline-flex items-center px-1.5 py-0.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-red-500"
                        onClick={() => handleRemoveComponent(index)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                          <title>Remove component</title>
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Required Dependencies Section */}
      {calculatedDependencies.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-2 mb-2 border border-gray-100">
          <h2 className="text-sm font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-amber-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
              <title>Required dependencies</title>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Required Dependencies
          </h2>
          
          <div className="overflow-x-auto shadow-sm rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th scope="col" className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th scope="col" className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {calculatedDependencies.map((item, index) => (
                  <tr key={`dep-${item.component.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 text-xs font-medium text-gray-900 whitespace-nowrap">{item.component.name}</td>
                    <td className="py-4 px-6 text-xs text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {item.component.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600 text-center whitespace-nowrap">{item.quantity}</td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium text-right whitespace-nowrap">{formatCurrency(item.component.price)}</td>
                    <td className="py-2 px-3 text-xs text-gray-900 font-medium text-right whitespace-nowrap">{formatCurrency(item.component.price * item.quantity)}</td>
                    <td className="py-2 px-3 text-xs text-center whitespace-nowrap">
                      {item.required ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                            <title>Required item</title>
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                            <title>Recommended item</title>
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Recommended
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Tank Pump Assignments Section */}
      {tankPumpAssignments.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg p-2 mb-2 border border-gray-100">
          <h2 className="text-sm font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
              <title>Tank-pump assignments</title>
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Tank-Pump Assignments
          </h2>
          
          <div className="space-y-6">
            {tankPumpAssignments.map((assignment, index) => {
              const tank = selectedComponents.find(item => 
                item.component.id === assignment.tankId
              )?.component;
              
              if (!tank) return null;
              
              const pumpComponents = availableComponents.pump?.filter(pump => 
                assignment.pumpIds.includes(pump.id)
              ) || [];
              
              return (
                <div key={`assign-${assignment.tankId}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                      <title>Tank</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <h3 className="font-semibold text-lg text-gray-900">{tank.name}</h3>
                  </div>
                  
                  {assignment.compatibilityNotes && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r">
                      <div className="flex">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                          <title>Compatibility notes</title>
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-yellow-700">{assignment.compatibilityNotes}</p>
                      </div>
                    </div>
                  )}
                  
                  <h4 className="font-medium text-xs text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                      <title>Compatible pumps</title>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Compatible Pumps
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pumpComponents.map(pump => (
                      <div key={pump.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                        <h4 className="font-medium text-gray-900 mb-2">{pump.name}</h4>
                        <p className="text-xs text-gray-600 mb-3">{pump.description}</p>
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                          <span className="text-xs text-gray-500">Unit Price</span>
                          <span className="text-xs font-semibold text-gray-900">{formatCurrency(pump.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Soil Movement Calculations Section */}
      {soilCalculations && (
        <div className="bg-white shadow-sm rounded-lg p-2 mb-2 border border-gray-100">
          <h2 className="text-sm font-semibold mb-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
              <title>Soil calculations</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Soil Movement Calculations
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-b from-blue-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                  <title>Excavation</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
                <h3 className="font-medium text-blue-700">Excavation Volume</h3>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{soilCalculations.excavationVolume}</div>
              <div className="text-xs font-medium text-gray-500">cubic yards</div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-b from-green-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                  <title>Backfill</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="font-medium text-green-700">Backfill Volume</h3>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{soilCalculations.backfillVolume.toFixed(2)}</div>
              <div className="text-xs font-medium text-gray-500">cubic yards</div>
              <div className="mt-3 flex items-center bg-green-50 p-2 rounded-md">
                <span className="text-xs uppercase tracking-wider text-green-800 font-semibold">Material:</span>
                <span className="ml-2 text-xs text-green-900">{soilCalculations.backfillMaterial}</span>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-3 bg-gradient-to-b from-red-50 to-white hover:shadow-md transition-shadow">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                  <title>Disposal</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <h3 className="font-medium text-red-700">Disposal Volume</h3>
              </div>
              <div className="text-xl font-bold text-gray-900 mb-1">{soilCalculations.disposalVolume}</div>
              <div className="text-xs font-medium text-gray-500">cubic yards</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                <title>Cost estimate</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg font-medium text-gray-700">Estimated Soil Moving Cost:</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(soilCalculations.totalCost)}</span>
          </div>
        </div>
      )}
      
      {/* Quote Summary Section */}
      <div className="bg-white shadow-md rounded-lg p-4 border border-gray-100">
        <h2 className="text-sm font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
            <title>Quote summary</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Quote Summary
        </h2>
        
        <div className="border-t border-gray-200 py-4 mb-4 space-y-3">
          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                <title>Selected components</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700">Selected Components Subtotal:</span>
            </div>
            <div className="font-medium text-gray-900">
              {formatCurrency(selectedComponents.reduce((sum, item) => sum + (item.component.price * item.quantity), 0))}
            </div>
          </div>
          
          <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                <title>Required dependencies</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700">Required Dependencies Subtotal:</span>
            </div>
            <div className="font-medium text-gray-900">
              {formatCurrency(calculatedDependencies
                .filter(dep => dep.required)
                .reduce((sum, item) => sum + (item.component.price * item.quantity), 0)
              )}
            </div>
          </div>
          
          {soilCalculations && (
            <div className="flex justify-between items-center p-1.5 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
                  <title>Soil movement</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-gray-700">Soil Movement Cost:</span>
              </div>
              <div className="font-medium text-gray-900">{formatCurrency(soilCalculations.totalCost)}</div>
            </div>
          )}
        </div>
        
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex justify-between items-center">
          <div className="font-semibold text-xl text-purple-900 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
              <title>Total quote amount</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Total Quote Amount:
          </div>
          <div className="font-bold text-lg text-purple-900">
            {formatCurrency(totalCost + (soilCalculations ? soilCalculations.totalCost : 0))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-4">
          <button type="button" className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium flex items-center shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
              <title>Save quote</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Quote
          </button>
          <button type="button" className="px-5 py-2 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 font-medium flex items-center shadow-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" role="img">
              <title>Export PDF</title>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
        
        {/* Helper functions for saving quotes and exporting PDFs */}
        {(() => {
          // Type definition for a quote to be saved
          interface SavedQuote {
            id?: string;
            date: string;
            components: {
              id: number;
              name: string;
              type: string;
              price: number;
              quantity: number;
            }[];
            dependencies: {
              id: number;
              name: string;
              type: string;
              price: number;
              quantity: number;
              required: boolean;
            }[];
            soilCalculations: SoilMovementCalculation | null;
            tankPumpAssignments: TankPumpAssignment[];
            totalCost: number;
          }
          
          // Function to save a quote
          const saveQuote = async (): Promise<void> => {
            if (selectedComponents.length === 0) return;
            
            try {
              // Prepare quote data
              const quoteData: SavedQuote = {
                date: new Date().toISOString(),
                components: selectedComponents.map(item => ({
                  id: item.component.id,
                  name: item.component.name,
                  type: item.component.type,
                  price: item.component.price,
                  quantity: item.quantity
                })),
                dependencies: calculatedDependencies.map(item => ({
                  id: item.component.id,
                  name: item.component.name,
                  type: item.component.type,
                  price: item.component.price,
                  quantity: item.quantity,
                  required: item.required
                })),
                soilCalculations,
                tankPumpAssignments,
                totalCost: totalCost + (soilCalculations ? soilCalculations.totalCost : 0)
              };
              
              // In a real implementation, this would call an API endpoint
              logDebug(`Saving quote: ${JSON.stringify(quoteData, null, 2)}`);
              
              // Simulate API call
              setTimeout(() => {
                alert('Quote saved successfully!');
              }, 1000);
            } catch (error) {
              logDebug(`Error saving quote: ${error instanceof Error ? error.message : String(error)}`);
              alert('Failed to save quote. Please try again.');
            }
          };
          
          // Function to export quote as PDF
          const exportPDF = async (): Promise<void> => {
            if (selectedComponents.length === 0) return;
            
            try {
              logDebug('Generating PDF export...');
              
              // In a real implementation, this would generate a PDF using a library like jsPDF
              // For now, we'll simulate the PDF generation
              setTimeout(() => {
                alert('PDF export feature will be implemented in the next sprint.');
              }, 1000);
            } catch (error) {
              logDebug(`Error exporting PDF: ${error instanceof Error ? error.message : String(error)}`);
              alert('Failed to export PDF. Please try again.');
            }
          };
          
          return (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 mr-2"
                disabled={selectedComponents.length === 0}
                onClick={saveQuote}
              >
                Save Quote
              </button>
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                disabled={selectedComponents.length === 0}
                onClick={exportPDF}
              >
                Export PDF
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
