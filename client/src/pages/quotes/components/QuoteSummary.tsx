import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Quote, Component } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateTotal, 
  calculateTax, 
  formatCurrency 
} from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Save, 
  FileUp, 
  Download, 
  ChevronDown, 
  FileText 
} from "lucide-react";

interface QuoteSummaryProps {
  quote: Quote;
  components: Component[];
  isLoading: boolean;
  onSave: () => void;
  onExport: () => void;
}

export default function QuoteSummary({ 
  quote, 
  components, 
  isLoading, 
  onSave, 
  onExport 
}: QuoteSummaryProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [notes, setNotes] = useState(quote.notes || "");
  
  // Calculate totals
  const subtotal = calculateTotal(components);
  const taxRate = 0.085; // 8.5%
  const tax = calculateTax(subtotal, taxRate);
  const total = subtotal + tax;
  
  // Handle save notes
  const saveNotesMutation = useMutation({
    mutationFn: async (updatedQuote: Partial<Quote>) => {
      const response = await apiRequest("PUT", `/api/quotes/${quote.id}`, updatedQuote);
      return await response.json() as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quote.id}`] });
      toast({
        title: "Notes saved",
        description: "Your notes have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving notes:", error);
      toast({
        title: "Error",
        description: "Failed to save notes. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle notes blur (save on blur)
  const handleNotesBlur = () => {
    if (notes !== quote.notes) {
      saveNotesMutation.mutate({
        notes
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        <div className="space-y-4 mb-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        
        <Skeleton className="h-20 w-full mb-6" />
        
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
    );
  }
  
  // Group components by type for display
  const componentsByType: Record<string, { count: number, total: number }> = {};
  
  components.forEach(component => {
    if (!componentsByType[component.type]) {
      componentsByType[component.type] = { count: 0, total: 0 };
    }
    componentsByType[component.type].count += component.quantity;
    componentsByType[component.type].total += Number(component.totalCost);
  });

  return (
    <Card className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
      <h3 className="font-ibm font-bold text-xl mb-4 flex items-center justify-between">
        <span>Quote Summary</span>
      </h3>
      
      <div className="space-y-4 mb-6">
        {Object.entries(componentsByType).length > 0 ? (
          Object.entries(componentsByType).map(([type, data]) => (
            <div className="flex justify-between" key={type}>
              <span className="text-[#718096]">
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {data.count > 1 && ` (${data.count})`}
              </span>
              <span className="font-medium">{formatCurrency(data.total)}</span>
            </div>
          ))
        ) : (
          <div className="py-4 text-center">
            <FileText className="h-10 w-10 mx-auto text-[#718096] mb-2" />
            <p className="text-[#718096]">No components added yet</p>
          </div>
        )}
      </div>
      
      <div className="border-t border-[#E2E8F0] pt-4 mb-6">
        <div className="flex justify-between font-medium">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-[#718096]">
          <span>Tax ({(taxRate * 100).toFixed(1)}%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        
        <div className="flex justify-between mt-4 text-lg font-bold text-primary">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          className="w-full bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white" 
          onClick={onSave}
        >
          <Save className="h-4 w-4 mr-2" /> Save Quote
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white">
              <FileUp className="h-4 w-4 mr-2" /> Export <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onExport}>
              <FileText className="h-4 w-4 mr-2" /> Export as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <Download className="h-4 w-4 mr-2" /> Export as Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-6 pt-4 border-t border-[#E2E8F0]">
        <h4 className="font-ibm font-medium text-base mb-2">Notes</h4>
        <Textarea 
          className="w-full px-3 py-2 border border-[#E2E8F0] rounded h-24 text-sm"
          placeholder="Add notes about this quote..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
        />
      </div>
    </Card>
  );
}
