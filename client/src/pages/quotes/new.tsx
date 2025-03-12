import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertQuoteSchema, Quote } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

// Extend the insert schema with client-side validation
const quoteFormSchema = insertQuoteSchema.extend({
  name: z.string().min(3, {
    message: "Quote name must be at least 3 characters.",
  }),
});

type QuoteFormValues = z.infer<typeof quoteFormSchema>;

export default function NewQuotePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      client: "",
      location: "",
      completionDate: "",
      notes: "",
      status: "draft",
      timeline: {
        phases: [],
        totalDuration: 0,
        contingencyDays: 0,
        weatherContingencyDays: 0,
        startDate: new Date().toISOString(),
        estimatedCompletionDate: new Date().toISOString(),
      },
      siteSpecificFactors: {
        soilCondition: {
          type: "",
          contaminationLevel: "none",
          extraCosts: 0
        },
        utilities: {
          electricalConnection: {
            distance: 0,
            costPerFoot: 0,
            totalCost: 0
          }
        },
        zoningRequirements: [],
        environmentalConcerns: []
      },
      vendors: [],
      operationalCosts: {
        maintenance: {
          annual: 0,
          fiveYear: 0,
          tenYear: 0
        },
        utilities: {
          electricity: {
            monthlyKwh: 0,
            monthlyCost: 0,
            annualCost: 0
          }
        },
        totalAnnualOperatingCost: 0
      }
    },
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (data: QuoteFormValues) => {
      const response = await apiRequest("POST", "/api/quotes", data);
      return await response.json() as Quote;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/quotes'] });
      toast({
        title: "Quote created",
        description: "Your quote has been created successfully.",
      });
      // Navigate to the edit page for the new quote
      navigate(`/quotes/${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating quote:", error);
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function onSubmit(data: QuoteFormValues) {
    setIsSubmitting(true);
    createQuoteMutation.mutate(data);
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate("/quotes")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Quotes
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary font-ibm">Create New Quote</h1>
        <p className="text-[#718096]">Start by entering the basic information for your quote</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quote Information</CardTitle>
          <CardDescription>Enter the details for your new gas station quote</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Name*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a descriptive name (e.g. San Diego Highway Station)" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Client name or organization" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City, State" 
                          {...field}
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="completionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Completion</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field}
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional information or special requirements" 
                        className="resize-none h-24" 
                        {...field}
                        value={field.value || ''} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/quotes")}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#4CAF50] hover:bg-[#4CAF50]/90"
                >
                  Create Quote
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
