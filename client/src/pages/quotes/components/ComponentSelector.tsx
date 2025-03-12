import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Component, InsertComponent, ManpowerRequirement } from "@shared/schema";
import { ComponentType } from "@/lib/types";
import { 
  componentTypes, 
  tankCapacities, 
  tankMaterials, 
  dispenserModels, 
  getComponentTemplate, 
  calculateTankVolume,
  defaultUnitCosts 
} from "@/lib/componentData";
import { 
  getDefaultManpowerForComponentType, 
  calculateManpowerCost 
} from "@/lib/manpowerData";
import { formatCurrency, formatNumber } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ManpowerSelector } from "@/components/ui/manpower-selector";
import { ManpowerMetrics } from "@/components/ui/manpower-metrics";
import { 
  Plus, 
  Trash2, 
  Edit, 
  XCircle,
  Users
} from "lucide-react";
import ConstructionItemSelector from "./ConstructionItemSelector";

interface ComponentSelectorProps {
  quoteId: number;
  components: Component[];
  isLoading: boolean;
}

export default function ComponentSelector({ 
  quoteId, 
  components, 
  isLoading 
}: ComponentSelectorProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ComponentType>('tank');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<number | null>(null);
  
  // Group components by type
  const groupedComponents = components.reduce((acc, component) => {
    const type = component.type as ComponentType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(component);
    return acc;
  }, {} as Record<string, Component[]>);
  
  // Handle add component
  const addComponentMutation = useMutation({
    mutationFn: async (component: InsertComponent) => {
      const response = await apiRequest("POST", "/api/components", component);
      return await response.json() as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}/components`] });
      toast({
        title: "Component added",
        description: "The component has been added to your quote.",
      });
      setAddDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error adding component:", error);
      toast({
        title: "Error",
        description: "Failed to add component. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle update component
  const updateComponentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<InsertComponent> }) => {
      const response = await apiRequest("PUT", `/api/components/${id}`, data);
      return await response.json() as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}/components`] });
      toast({
        title: "Component updated",
        description: "The component has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating component:", error);
      toast({
        title: "Error",
        description: "Failed to update component. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle delete component
  const deleteComponentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/components/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}/components`] });
      toast({
        title: "Component deleted",
        description: "The component has been removed from your quote.",
      });
      setComponentToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting component:", error);
      toast({
        title: "Error",
        description: "Failed to delete component. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle add component
  const handleAddComponent = (type: ComponentType) => {
    setSelectedType(type);
    
    // Get component template
    const template = getComponentTemplate(type);
    
    // Add quote ID and ensure configuration is stringified for transmission
    const componentData: InsertComponent = {
      ...template,
      quoteId,
      unitCost: String(template.unitCost),
      totalCost: String(template.totalCost),
      configuration: JSON.stringify(template.configuration),
    };
    
    console.log("Adding component:", componentData);
    
    addComponentMutation.mutate(componentData);
  };
  
  // Update component quantity
  const handleUpdateQuantity = (component: Component, quantity: number) => {
    const totalCost = quantity * Number(component.unitCost);
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        quantity,
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update tank capacity
  const handleUpdateTankCapacity = (component: Component, capacity: string) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      capacity,
    };
    
    // Update unit cost based on capacity
    const unitCost = defaultUnitCosts.tank[capacity as keyof typeof defaultUnitCosts.tank];
    const totalCost = (component.quantity || 1) * unitCost;
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        unitCost: String(unitCost),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update dispenser model
  const handleUpdateDispenserModel = (component: Component, model: string) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      model,
    };
    
    // Update unit cost based on model
    const unitCost = defaultUnitCosts.dispenser[model as keyof typeof defaultUnitCosts.dispenser];
    const totalCost = (component.quantity || 1) * unitCost;
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        unitCost: String(unitCost),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update soil extraction volume
  const handleUpdateSoilVolume = (component: Component, volume: number) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      volume,
    };
    
    // Update total cost based on volume and unit cost
    const totalCost = volume * Number(component.unitCost);
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update concrete area
  const handleUpdateConcreteArea = (component: Component, area: number) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      area,
    };
    
    // Update total cost based on area and unit cost
    const totalCost = area * Number(component.unitCost);
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update administrative building size
  const handleUpdateBuildingSize = (component: Component, size: number) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      size,
    };
    
    // Update total cost based on size and unit cost
    const totalCost = size * Number(component.unitCost);
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Update component unit cost
  const handleUpdateUnitCost = (component: Component, unitCost: number) => {
    const totalCost = (component.quantity || 1) * unitCost;
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        unitCost: String(unitCost),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Handle update manpower requirements
  const handleUpdateManpower = (component: Component, manpowerRequirements: ManpowerRequirement[]) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const newConfiguration = {
      ...configuration,
      manpower: manpowerRequirements,
    };
    
    // Calculate manpower cost to include in total cost
    const manpowerCost = calculateManpowerCost(manpowerRequirements);
    const materialCost = Number(component.unitCost) * (component.quantity || 1);
    const totalCost = materialCost + manpowerCost;
    
    updateComponentMutation.mutate({
      id: component.id,
      data: {
        configuration: JSON.stringify(newConfiguration),
        totalCost: String(totalCost),
      }
    });
  };
  
  // Handle component delete
  const handleDeleteComponent = () => {
    if (componentToDelete) {
      deleteComponentMutation.mutate(componentToDelete);
    }
  };
  
  // Calculate configuration values
  function getConfigValue(component: Component, key: string): any {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    return configuration[key];
  }
  
  // Get manpower requirements for a component
  function getManpowerRequirements(component: Component): ManpowerRequirement[] {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    return configuration.manpower || [];
  }
  
  // Render add component button for a specific type
  const renderAddComponentButton = (type: ComponentType) => (
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-ibm font-medium text-lg">{
        componentTypes.find(c => c.id === type)?.name || 'Components'
      }</h4>
      <Button 
        variant="ghost" 
        className="text-[#FF6B00] hover:text-[#FF6B00]/80 font-medium"
        onClick={() => handleAddComponent(type)}
      >
        <Plus className="h-4 w-4 mr-1" /> Add {
          componentTypes.find(c => c.id === type)?.name || 'Component'
        }
      </Button>
    </div>
  );
  
  // Render a single component card
  const renderComponentCard = (component: Component) => {
    const componentTypeInfo = componentTypes.find(c => c.id === component.type);
    
    return (
      <div className="bg-[#F5F7FA] rounded-lg p-4 mb-4 transition duration-200 border border-[#E2E8F0] hover:shadow-md hover:-translate-y-0.5">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-start">
              <div className="text-primary text-2xl mr-4 mt-1">
                {component.type === 'tank' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 16a3 3 0 0 1-.5-6L9 3h6l2.5 7a3 3 0 0 1-.5 6v2a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                )}
                {component.type === 'dispenser' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7v14h14v-2"></path>
                    <path d="M4 17h8"></path>
                    <path d="M15 4h5v5"></path>
                    <path d="M15 9V4L9 10l5 5 1-1"></path>
                  </svg>
                )}
                {component.type === 'soil' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 17H5"></path>
                    <path d="M3 17h2"></path>
                    <path d="M19 17h2"></path>
                    <rect x="5" y="7" width="14" height="10" rx="2"></rect>
                  </svg>
                )}
                {component.type === 'concrete' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2"></rect>
                    <rect x="6" y="6" width="12" height="12" rx="1"></rect>
                  </svg>
                )}
                {component.type === 'administrative' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="12" rx="2"></rect>
                    <path d="M10 8V5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1v3"></path>
                    <path d="M7 19v2"></path>
                    <path d="M17 19v2"></path>
                  </svg>
                )}
              </div>
              <div>
                <h5 className="font-ibm font-medium">{component.name}</h5>
                <p className="text-sm text-[#718096]">{component.description}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {component.type === 'tank' && (
              <div>
                <Label className="block text-xs text-[#718096] mb-1">Capacity</Label>
                <Select 
                  defaultValue={getConfigValue(component, 'capacity')}
                  onValueChange={(value) => handleUpdateTankCapacity(component, value)}
                >
                  <SelectTrigger className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tankCapacities.map((capacity) => (
                      <SelectItem key={capacity.value} value={capacity.value}>
                        {capacity.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {component.type === 'dispenser' && (
              <div>
                <Label className="block text-xs text-[#718096] mb-1">Model</Label>
                <Select 
                  defaultValue={getConfigValue(component, 'model')}
                  onValueChange={(value) => handleUpdateDispenserModel(component, value)}
                >
                  <SelectTrigger className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dispenserModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {component.type === 'soil' && (
              <div>
                <Label className="block text-xs text-[#718096] mb-1">Volume</Label>
                <div className="flex">
                  <Input 
                    type="number"
                    defaultValue={getConfigValue(component, 'volume')}
                    min={1}
                    className="w-full px-2 py-1 border border-[#E2E8F0] rounded-l text-sm"
                    onChange={(e) => handleUpdateSoilVolume(component, parseInt(e.target.value))}
                  />
                  <span className="bg-[#E2E8F0] px-2 flex items-center text-xs border-t border-r border-b border-[#E2E8F0] rounded-r">
                    m³
                  </span>
                </div>
              </div>
            )}
            
            {component.type === 'concrete' && (
              <div>
                <Label className="block text-xs text-[#718096] mb-1">Area</Label>
                <div className="flex">
                  <Input 
                    type="number"
                    defaultValue={getConfigValue(component, 'area')}
                    min={1}
                    className="w-full px-2 py-1 border border-[#E2E8F0] rounded-l text-sm"
                    onChange={(e) => handleUpdateConcreteArea(component, parseInt(e.target.value))}
                  />
                  <span className="bg-[#E2E8F0] px-2 flex items-center text-xs border-t border-r border-b border-[#E2E8F0] rounded-r">
                    m²
                  </span>
                </div>
              </div>
            )}
            
            {component.type === 'administrative' && (
              <div>
                <Label className="block text-xs text-[#718096] mb-1">Size</Label>
                <div className="flex">
                  <Input 
                    type="number"
                    defaultValue={getConfigValue(component, 'size')}
                    min={1}
                    className="w-full px-2 py-1 border border-[#E2E8F0] rounded-l text-sm"
                    onChange={(e) => handleUpdateBuildingSize(component, parseInt(e.target.value))}
                  />
                  <span className="bg-[#E2E8F0] px-2 flex items-center text-xs border-t border-r border-b border-[#E2E8F0] rounded-r">
                    m²
                  </span>
                </div>
              </div>
            )}
            
            <div>
              <Label className="block text-xs text-[#718096] mb-1">Quantity</Label>
              <Input 
                type="number"
                defaultValue={String(component.quantity || 1)}
                min={1}
                className="w-full px-2 py-1 border border-[#E2E8F0] rounded text-sm"
                onChange={(e) => handleUpdateQuantity(component, parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label className="block text-xs text-[#718096] mb-1">Cost (each)</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-sm text-[#718096]">$</span>
                <Input 
                  type="text"
                  value={formatNumber(Number(component.unitCost))}
                  className="w-full pl-6 px-2 py-1 border border-[#E2E8F0] rounded text-sm"
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    handleUpdateUnitCost(component, parseFloat(value));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Manpower Management Section */}
        <div className="mt-4">
          <ManpowerSelector
            manpowerRequirements={getManpowerRequirements(component)}
            onChange={(requirements) => handleUpdateManpower(component, requirements)}
            componentType={component.type}
          />
          
          {/* Only show metrics if there are manpower requirements */}
          {getManpowerRequirements(component).length > 0 && (
            <ManpowerMetrics 
              manpowerRequirements={getManpowerRequirements(component)} 
            />
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex justify-between items-center">
          <div>
            <span className="text-sm text-[#718096]">Total: </span>
            <span className="font-medium">{formatCurrency(Number(component.totalCost))}</span>
          </div>
          <div>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-[#718096] hover:text-[#2C3E50] mr-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setComponentToDelete(component.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this component from your quote.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setComponentToDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteComponent}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <h3 className="font-ibm font-bold text-xl mb-4">Components</h3>
      
      {/* Fuel Tanks Section */}
      <div className="mb-8">
        {renderAddComponentButton('tank')}
        
        {groupedComponents.tank?.map(component => (
          <div key={component.id}>
            {renderComponentCard(component)}
          </div>
        ))}
        
        {(!groupedComponents.tank || groupedComponents.tank.length === 0) && (
          <div className="bg-[#F5F7FA] rounded-lg p-4 mb-4 border border-dashed border-[#E2E8F0] text-center">
            <p className="text-[#718096] mb-2">No fuel tanks added yet</p>
            <Button 
              variant="outline" 
              size="sm"
              className="text-[#FF6B00] border-[#FF6B00]"
              onClick={() => handleAddComponent('tank')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Fuel Tank
            </Button>
          </div>
        )}
      </div>
      
      {/* Dispensers Section */}
      <div className="mb-8">
        {renderAddComponentButton('dispenser')}
        
        {groupedComponents.dispenser?.map(component => (
          <div key={component.id}>
            {renderComponentCard(component)}
          </div>
        ))}
        
        {(!groupedComponents.dispenser || groupedComponents.dispenser.length === 0) && (
          <div className="bg-[#F5F7FA] rounded-lg p-4 mb-4 border border-dashed border-[#E2E8F0] text-center">
            <p className="text-[#718096] mb-2">No dispensers added yet</p>
            <Button 
              variant="outline" 
              size="sm"
              className="text-[#FF6B00] border-[#FF6B00]"
              onClick={() => handleAddComponent('dispenser')}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Dispenser
            </Button>
          </div>
        )}
      </div>
      
      {/* Additional Components Section */}
      <div>
        <h4 className="font-ibm font-medium text-lg mb-4">Additional Components</h4>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full mb-4 border-dashed border-[#E2E8F0] text-[#718096]"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Component
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Component</DialogTitle>
              <DialogDescription>
                Select a component type to add to your quote.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
              {componentTypes.map((type) => (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-auto p-4 justify-start flex-col items-start text-left"
                  onClick={() => handleAddComponent(type.id as ComponentType)}
                >
                  <div className="font-medium text-primary mb-1">{type.name}</div>
                  <div className="text-sm text-[#718096]">{type.description}</div>
                </Button>
              ))}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Soil Extraction */}
        {groupedComponents.soil?.map(component => (
          <div key={component.id}>
            {renderComponentCard(component)}
          </div>
        ))}
        
        {/* Concrete Application */}
        {groupedComponents.concrete?.map(component => (
          <div key={component.id}>
            {renderComponentCard(component)}
          </div>
        ))}
        
        {/* Administrative Spaces */}
        {groupedComponents.administrative?.map(component => (
          <div key={component.id}>
            {renderComponentCard(component)}
          </div>
        ))}
        
        {/* Other Component Types */}
        {Object.entries(groupedComponents)
          .filter(([type]) => !['tank', 'dispenser', 'soil', 'concrete', 'administrative'].includes(type))
          .flatMap(([, comps]) => comps)
          .map(component => (
            <div key={component.id}>
              {renderComponentCard(component)}
            </div>
          ))
        }
      </div>
    </div>
  );
}
