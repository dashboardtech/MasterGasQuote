import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Component, InsertComponent, ConstructionDivision, ConstructionItem } from "@shared/schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface ConstructionItemSelectorProps {
  quoteId: number;
}

export default function ConstructionItemSelector({ quoteId }: ConstructionItemSelectorProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedDivisionId, setSelectedDivisionId] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  // Fetch all construction divisions
  const { 
    data: divisions, 
    isLoading: isLoadingDivisions 
  } = useQuery<ConstructionDivision[]>({
    queryKey: ['/api/construction/divisions'],
    enabled: open
  });

  // Fetch items for selected division
  const {
    data: items,
    isLoading: isLoadingItems
  } = useQuery<ConstructionItem[]>({
    queryKey: [`/api/construction/divisions/${selectedDivisionId}/items`],
    enabled: !!selectedDivisionId && open
  });

  // Add component mutation
  const addComponentMutation = useMutation({
    mutationFn: async (component: InsertComponent) => {
      const response = await apiRequest("POST", "/api/components", component);
      return await response.json() as Component;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}/components`] });
      toast({
        title: "Construction item added",
        description: "The construction item has been added to your quote as a component.",
      });
      setOpen(false);
      setSelectedItems([]);
    },
    onError: (error) => {
      console.error("Error adding construction item as component:", error);
      toast({
        title: "Error",
        description: "Failed to add construction item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle division selection
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivisionId(Number(divisionId));
    setSelectedItems([]);
  };

  // Handle item selection toggle
  const handleItemToggle = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Handle adding selected items as components
  const handleAddItems = () => {
    if (!items || selectedItems.length === 0) return;
    
    // Get the selected construction items
    const selectedConstructionItems = items.filter(item => selectedItems.includes(item.id));
    
    // Convert the first selected item to a component
    const firstItem = selectedConstructionItems[0];
    
    if (!firstItem) return;
    
    // Create component data from the construction item
    const componentData: InsertComponent = {
      quoteId,
      type: 'custom',  // Use a custom type for construction items
      name: firstItem.description || '',
      description: `Construction item from Division ${firstItem.divisionId}`,
      quantity: quantity,
      unitCost: String((firstItem.totalCost || 0) / (firstItem.quantity || 1)),
      totalCost: String(((firstItem.totalCost || 0) / (firstItem.quantity || 1)) * quantity),
      configuration: JSON.stringify({
        constructionItemId: firstItem.id,
        divisionId: firstItem.divisionId,
        code: firstItem.code,
        unit: firstItem.unit,
        laborCost: firstItem.laborCost,
        materialCost: firstItem.materialCost,
        notes: firstItem.notes || '',
      })
    };
    
    console.log("Adding construction item as component:", componentData);
    
    addComponentMutation.mutate(componentData);
  };

  return (
    <div className="mb-8">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Add Construction Item as Component
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Construction Item</DialogTitle>
            <DialogDescription>
              Select an item from a construction division to add as a component to your quote.
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDivisions ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="division" className="text-sm font-medium">
                    Select Construction Division
                  </label>
                  <Select 
                    onValueChange={handleDivisionChange}
                    value={selectedDivisionId?.toString()}
                  >
                    <SelectTrigger id="division">
                      <SelectValue placeholder="Select a division" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisions?.map(division => (
                        <SelectItem 
                          key={division.id} 
                          value={division.id.toString()}
                        >
                          {division.divisionNumber} - {division.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedDivisionId && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="construction-items" className="text-sm font-medium">
                        Construction Items
                      </label>
                      <div className="flex items-center space-x-2">
                        <label htmlFor="quantity" className="text-sm">Quantity:</label>
                        <Input
                          id="quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                          className="w-20"
                          min="1"
                        />
                      </div>
                    </div>
                    <span id="construction-items" className="sr-only">Available construction items</span>
                    
                    {isLoadingItems ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : items && items.length > 0 ? (
                      <div className="border rounded-md divide-y">
                        {items.map(item => (
                          <button 
                            type="button"
                            key={item.id}
                            className={`p-3 w-full text-left cursor-pointer hover:bg-gray-50 flex justify-between ${
                              selectedItems.includes(item.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleItemToggle(item.id)}
                          >
                            <div>
                              <div className="font-medium">{item.code} - {item.description}</div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} {item.unit} | 
                                Labor: ${item.laborCost?.toFixed(2)} | 
                                Material: ${item.materialCost?.toFixed(2)}
                              </div>
                            </div>
                            <div className="font-semibold">
                              ${item.totalCost?.toFixed(2)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        No items found in this division
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddItems}
                  disabled={selectedItems.length === 0 || addComponentMutation.isPending}
                >
                  {addComponentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                      Adding...
                    </>
                  ) : (
                    'Add to Quote'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
