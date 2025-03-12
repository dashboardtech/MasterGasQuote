import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Quote } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDate } from "@/lib/utils";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Save } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Quote name must be at least 3 characters"),
  client: z.string().optional(),
  location: z.string().optional(),
  completionDate: z.string().optional(),
});

interface QuoteHeaderProps {
  quote: Quote;
  onSave: () => void;
  onExport: () => void;
  isSaving: boolean;
  isExporting: boolean;
}

export default function QuoteHeader({ 
  quote, 
  onSave,
  onExport,
  isSaving,
  isExporting
}: QuoteHeaderProps) {
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: quote.name,
      client: quote.client || "",
      location: quote.location || "",
      completionDate: quote.completionDate || "",
    },
  });

  // Update quote data when form changes
  const handleFormChange = async (field: string, value: string) => {
    try {
      // Update the quote on the server
      await apiRequest("PUT", `/api/quotes/${quote.id}`, {
        [field]: value,
      });
      
      // Invalidate and refetch the quote
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quote.id}`] });
    } catch (error) {
      console.error(`Error updating quote ${field}:`, error);
    }
  };
  
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h2 className="font-ibm font-bold text-2xl text-primary">{quote.name}</h2>
          <p className="text-[#718096] text-sm">
            Created: {formatDate(quote.createdAt)} • 
            Last modified: {formatDate(quote.updatedAt)}
          </p>
        </div>
        <div className="flex mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            className="mr-2"
            onClick={onExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white"
            onClick={onSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Quote
          </Button>
        </div>
      </div>
      
      <Card className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <CardContent className="p-0">
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-2 text-[#718096]">
                      Quote Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded"
                        onBlur={() => {
                          if (field.value !== quote.name) {
                            handleFormChange("name", field.value);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-2 text-[#718096]">
                      Client
                    </FormLabel>
                    <Select 
                      defaultValue={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleFormChange("client", value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PetroMax Industries">PetroMax Industries</SelectItem>
                        <SelectItem value="GasCorp International">GasCorp International</SelectItem>
                        <SelectItem value="FuelTech Solutions">FuelTech Solutions</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-2 text-[#718096]">
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded"
                        onBlur={() => {
                          if (field.value !== quote.location) {
                            handleFormChange("location", field.value);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium mb-2 text-[#718096]">
                      Expected Completion
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        className="w-full px-3 py-2 border border-[#E2E8F0] rounded"
                        onBlur={() => {
                          if (field.value !== quote.completionDate) {
                            handleFormChange("completionDate", field.value);
                          }
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
