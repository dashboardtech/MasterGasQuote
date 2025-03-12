import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Component, InsertComponent } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package, Filter, Trash2, Edit, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { componentTypes, getComponentTemplate } from "@/lib/componentData";
import { ComponentTree } from "@/components/ui/component-tree";
import { getUnitMeasurementOptions, defaultUnitMeasurementsByType } from "@/lib/unitMeasurements";

export default function ComponentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [selectedComponentType, setSelectedComponentType] = useState<string>("");
  const [newComponentName, setNewComponentName] = useState("");
  const [newComponentDescription, setNewComponentDescription] = useState("");
  const [newComponentUnitCost, setNewComponentUnitCost] = useState<string>("0");
  const [newComponentUnitMeasurement, setNewComponentUnitMeasurement] = useState<string>("");
  const [editComponentName, setEditComponentName] = useState("");
  const [editComponentDescription, setEditComponentDescription] = useState("");
  const [editComponentUnitCost, setEditComponentUnitCost] = useState<string>("0");
  const [editComponentUnitMeasurement, setEditComponentUnitMeasurement] = useState<string>("");
  const [quoteId, setQuoteId] = useState<number>(1); // Default to first quote
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  // Fetch all components - this is just a placeholder as we need a dedicated endpoint
  const { data: components = [], isLoading } = useQuery({
    queryKey: ['/api/components'],
    queryFn: async () => {
      try {
        // For now, get components from the first quote as an example
        const response = await apiRequest("GET", "/api/quotes/1/components");
        const data = await response.json();
        return data as Component[];
      } catch (error) {
        console.error("Error fetching components:", error);
        toast({
          title: "Error",
          description: "Failed to load components. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Add component mutation
  const createComponentMutation = useMutation({
    mutationFn: async (componentData: InsertComponent) => {
      const response = await apiRequest("POST", "/api/components", componentData);
      return await response.json() as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/components'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/1/components'] });
      toast({
        title: "Component added",
        description: "New component has been added successfully"
      });
      setIsAddDialogOpen(false);
      resetFormFields();
    },
    onError: (error) => {
      console.error("Error creating component:", error);
      toast({
        title: "Error",
        description: "Failed to add component. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete component mutation
  const deleteComponentMutation = useMutation({
    mutationFn: async (componentId: number) => {
      const response = await apiRequest("DELETE", `/api/components/${componentId}`);
      return response.status === 204;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/components'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/1/components'] });
      toast({
        title: "Component deleted",
        description: "The component has been removed successfully"
      });
    },
    onError: (error) => {
      console.error("Error deleting component:", error);
      toast({
        title: "Error",
        description: "Failed to delete component. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Update component mutation
  const updateComponentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertComponent> }) => {
      const response = await apiRequest("PUT", `/api/components/${id}`, data);
      return await response.json() as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/components'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quotes/1/components'] });
      toast({
        title: "Component updated",
        description: "The component has been updated successfully"
      });
      setIsEditDialogOpen(false);
      setSelectedComponent(null);
    },
    onError: (error) => {
      console.error("Error updating component:", error);
      toast({
        title: "Error",
        description: "Failed to update component. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetFormFields = () => {
    setSelectedComponentType("");
    setNewComponentName("");
    setNewComponentDescription("");
    setNewComponentUnitCost("0");
    setNewComponentUnitMeasurement("");
    setSelectedParentId(null);
  };

  const handleAddComponent = () => {
    if (!selectedComponentType) {
      toast({
        title: "Missing type",
        description: "Please select a component type",
        variant: "destructive",
      });
      return;
    }

    if (!newComponentName) {
      toast({
        title: "Missing name",
        description: "Please enter a component name",
        variant: "destructive",
      });
      return;
    }

    const template = getComponentTemplate(selectedComponentType as any);
    const unitMeasurement = newComponentUnitMeasurement || 
      defaultUnitMeasurementsByType[selectedComponentType as keyof typeof defaultUnitMeasurementsByType] || 
      'unit';
    
    // Use the entered unit cost or default from template
    const unitCost = newComponentUnitCost && parseFloat(newComponentUnitCost) > 0 
      ? newComponentUnitCost 
      : template.unitCost.toString();
    
    // Update configuration with unit measurement
    const configuration = {
      ...template.configuration,
      unitMeasurement
    };

    const newComponent: InsertComponent = {
      quoteId,
      type: selectedComponentType as any,
      name: newComponentName,
      description: newComponentDescription || template.description,
      configuration,
      quantity: 1,
      unitCost,
      totalCost: unitCost, // Same as unit cost initially for a single item
      parentId: selectedParentId
    };

    createComponentMutation.mutate(newComponent);
  };
  
  const handleUpdateComponent = () => {
    if (!selectedComponent) return;
    
    if (!editComponentName) {
      toast({
        title: "Missing name",
        description: "Please enter a component name",
        variant: "destructive",
      });
      return;
    }
    
    // Parse the configuration to update unit measurement if provided
    let updatedConfiguration = selectedComponent.configuration ? 
      { ...selectedComponent.configuration, unitMeasurement: editComponentUnitMeasurement } : 
      { unitMeasurement: editComponentUnitMeasurement };
    
    updateComponentMutation.mutate({
      id: selectedComponent.id,
      data: {
        name: editComponentName,
        description: editComponentDescription || undefined,
        unitCost: editComponentUnitCost,
        // Recalculate total cost based on quantity and new unit cost
        totalCost: (parseFloat(editComponentUnitCost) * (selectedComponent.quantity || 1)).toString(),
        configuration: updatedConfiguration
      }
    });
  };

  // Filter components based on search query and active tab
  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (component.description && component.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTab = activeTab === "all" || component.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Component Library</h1>
          <p className="text-[#718096]">Manage reusable components for your gas station quotes</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#718096]" size={16} />
            <Input
              placeholder="Search components..."
              className="pl-9 w-full sm:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Component
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <TabsList className="bg-transparent border rounded-md p-1">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  All Types
                </TabsTrigger>
                {componentTypes.map((type) => (
                  <TabsTrigger 
                    key={type.id}
                    value={type.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                  >
                    {type.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="hierarchy"
                  className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-md"
                >
                  Hierarchy View
                </TabsTrigger>
              </TabsList>
              
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>
            
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="p-4">
                        <Skeleton className="h-6 w-1/4 mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-4 w-1/2" />
                      </Card>
                    ))}
                  </div>
                </div>
              ) : activeTab === "hierarchy" ? (
                <div className="p-4">
                  <ComponentTree 
                    components={components}
                    onAddSubcomponent={(parentId) => {
                      // Set the parent ID for a new component
                      setSelectedParentId(parentId);
                      setIsAddDialogOpen(true);
                    }}
                    onViewDetails={(component) => {
                      setSelectedComponent(component);
                      setEditComponentName(component.name);
                      setEditComponentDescription(component.description || "");
                      setEditComponentUnitCost(component.unitCost);
                      // Get unit measurement from component configuration if available
                      const unitMeasurement = component.configuration?.unitMeasurement || 
                        defaultUnitMeasurementsByType[component.type as keyof typeof defaultUnitMeasurementsByType] || 
                        'unit';
                      setEditComponentUnitMeasurement(unitMeasurement);
                      setIsEditDialogOpen(true);
                    }}
                  />
                </div>
              ) : filteredComponents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Unit Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComponents.map((component) => (
                      <TableRow key={component.id}>
                        <TableCell className="font-medium">{component.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {component.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {component.description || "No description available"}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(parseFloat(component.unitCost))}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComponent(component);
                                setEditComponentName(component.name);
                                setEditComponentDescription(component.description || "");
                                setEditComponentUnitCost(component.unitCost);
                                // Get unit measurement from component configuration if available
                                const unitMeasurement = component.configuration?.unitMeasurement || 
                                  defaultUnitMeasurementsByType[component.type as keyof typeof defaultUnitMeasurementsByType] || 
                                  'unit';
                                setEditComponentUnitMeasurement(unitMeasurement);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComponent(component);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <Package className="h-12 w-12 text-[#718096]/50 mb-4" />
                  <h3 className="text-lg font-medium">No components found</h3>
                  <p className="text-[#718096] mb-4">
                    {searchQuery ? "Try adjusting your search or filter criteria" : "Add your first component to get started"}
                  </p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Component
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Component Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) resetFormFields();
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Component</DialogTitle>
            <DialogDescription>
              Create a new component for your gas station quotes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="componentType">Component Type</Label>
              <Select 
                value={selectedComponentType} 
                onValueChange={setSelectedComponentType}
              >
                <SelectTrigger id="componentType">
                  <SelectValue placeholder="Select component type" />
                </SelectTrigger>
                <SelectContent>
                  {componentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="componentName">Component Name</Label>
              <Input
                id="componentName"
                value={newComponentName}
                onChange={(e) => setNewComponentName(e.target.value)}
                placeholder="Enter component name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="componentDescription">Description (Optional)</Label>
              <Input
                id="componentDescription"
                value={newComponentDescription}
                onChange={(e) => setNewComponentDescription(e.target.value)}
                placeholder="Enter component description"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="componentUnitCost">Unit Cost ($)</Label>
              <Input
                id="componentUnitCost"
                type="number"
                min="0"
                step="0.01"
                value={newComponentUnitCost}
                onChange={(e) => setNewComponentUnitCost(e.target.value)}
                placeholder="Enter unit cost"
              />
            </div>
            
            {selectedComponentType && (
              <div className="grid gap-2">
                <Label htmlFor="componentUnitMeasurement">Unit Measurement</Label>
                <Select 
                  value={newComponentUnitMeasurement} 
                  onValueChange={setNewComponentUnitMeasurement}
                >
                  <SelectTrigger id="componentUnitMeasurement">
                    <SelectValue placeholder={`Default (${defaultUnitMeasurementsByType[selectedComponentType as keyof typeof defaultUnitMeasurementsByType] || 'unit'})`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnitMeasurementOptions(selectedComponentType).map(option => (
                      <SelectItem key={option?.value} value={option?.value || ""}>
                        {option?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select measurement unit for this component
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="parentComponent">Parent Component (Optional)</Label>
              <Select 
                value={selectedParentId?.toString() || "null"} 
                onValueChange={(value) => setSelectedParentId(value && value !== "null" ? parseInt(value) : null)}
              >
                <SelectTrigger id="parentComponent">
                  <SelectValue placeholder="None (Root Component)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None (Root Component)</SelectItem>
                  {components.map(component => (
                    <SelectItem key={component.id} value={component.id.toString()}>
                      {component.name} ({component.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select a parent component to create a hierarchical relationship
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddComponent}
              disabled={createComponentMutation.isPending}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              {createComponentMutation.isPending ? 'Adding...' : 'Add Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Component Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setSelectedComponent(null);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Component</DialogTitle>
            <DialogDescription>
              Update component details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editComponentType">Component Type</Label>
                <Input
                  id="editComponentType"
                  value={selectedComponent.type.charAt(0).toUpperCase() + selectedComponent.type.slice(1)}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="editComponentName">Component Name</Label>
                <Input
                  id="editComponentName"
                  value={editComponentName}
                  onChange={(e) => setEditComponentName(e.target.value)}
                  placeholder="Enter component name"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="editComponentDescription">Description (Optional)</Label>
                <Input
                  id="editComponentDescription"
                  value={editComponentDescription}
                  onChange={(e) => setEditComponentDescription(e.target.value)}
                  placeholder="Enter component description"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="editComponentUnitCost">Unit Cost ($)</Label>
                <Input
                  id="editComponentUnitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editComponentUnitCost}
                  onChange={(e) => setEditComponentUnitCost(e.target.value)}
                  placeholder="Enter unit cost"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="editComponentUnitMeasurement">Unit Measurement</Label>
                <Select 
                  value={editComponentUnitMeasurement} 
                  onValueChange={setEditComponentUnitMeasurement}
                >
                  <SelectTrigger id="editComponentUnitMeasurement">
                    <SelectValue placeholder={`Default (${defaultUnitMeasurementsByType[selectedComponent.type as keyof typeof defaultUnitMeasurementsByType] || 'unit'})`} />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnitMeasurementOptions(selectedComponent.type).map(option => (
                      <SelectItem key={option?.value} value={option?.value || ""}>
                        {option?.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateComponent}
              disabled={updateComponentMutation.isPending}
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            >
              {updateComponentMutation.isPending ? 'Updating...' : 'Update Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this component? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <div className="py-4">
              <p className="font-medium">{selectedComponent.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Type: <Badge variant="outline" className="ml-1 capitalize">{selectedComponent.type}</Badge>
              </p>
              {selectedComponent.description && (
                <p className="text-sm text-muted-foreground mt-2">{selectedComponent.description}</p>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedComponent) {
                  deleteComponentMutation.mutate(selectedComponent.id);
                  setIsDeleteDialogOpen(false);
                }
              }}
              disabled={deleteComponentMutation.isPending}
            >
              {deleteComponentMutation.isPending ? 'Deleting...' : 'Delete Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}