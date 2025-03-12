import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Quote, Component, TimelineEstimation, SiteSpecificFactors, OperationalCostProjection } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Clock, Map, Briefcase, Calculator } from "lucide-react";
import QuoteHeader from "./components/QuoteHeader";
import ConfigurationStepper from "./components/ConfigurationStepper";
import ComponentSelector from "./components/ComponentSelector";
import QuoteSummary from "./components/QuoteSummary";
import ManpowerSummary from "./components/ManpowerSummary";
import { TimelineEstimator } from "@/components/ui/timeline-estimator";
import { VendorManager } from "@/components/ui/vendor-manager";
import { SiteFactorsAnalyzer } from "@/components/ui/site-factors-analyzer";
import { OperationalCostCalculator } from "@/components/ui/operational-cost-calculator";

export default function EditQuotePage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute<{ id: string }>("/quotes/:id");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("configuration");
  const [isExporting, setIsExporting] = useState(false);
  
  const quoteId = match ? parseInt(params.id) : null;
  
  // Fetch quote data
  const { 
    data: quote, 
    isLoading: isLoadingQuote, 
    isError: isQuoteError 
  } = useQuery<Quote>({ 
    queryKey: [`/api/quotes/${quoteId}`],
    enabled: !!quoteId
  });
  
  // Fetch components data
  const { 
    data: components, 
    isLoading: isLoadingComponents,
    isError: isComponentsError
  } = useQuery<Component[]>({ 
    queryKey: [`/api/quotes/${quoteId}/components`],
    enabled: !!quoteId
  });
  
  // Handle save quote
  const saveQuoteMutation = useMutation({
    mutationFn: async (updatedQuote: Partial<Quote>) => {
      const response = await apiRequest("PUT", `/api/quotes/${quoteId}`, updatedQuote);
      return await response.json() as Quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quotes/${quoteId}`] });
      toast({
        title: "Quote saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving quote:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle export as PDF (mock functionality)
  const handleExport = () => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "Your quote has been exported successfully.",
      });
      setIsExporting(false);
    }, 1500);
  };
  
  // Go to previous step
  const handlePrevStep = () => {
    if (activeTab === "specifications") {
      setActiveTab("configuration");
    } else if (activeTab === "summary") {
      setActiveTab("specifications");
    }
  };
  
  // Go to next step
  const handleNextStep = () => {
    if (activeTab === "configuration") {
      setActiveTab("specifications");
    } else if (activeTab === "specifications") {
      setActiveTab("summary");
    }
  };
  
  // Handle save quote
  const handleSaveQuote = () => {
    if (!quote) return;
    
    saveQuoteMutation.mutate({
      ...quote,
      updatedAt: new Date(),
    });
  };
  
  // Redirect if not found
  useEffect(() => {
    if (isQuoteError) {
      toast({
        title: "Quote not found",
        description: "The requested quote could not be found.",
        variant: "destructive",
      });
      navigate("/quotes");
    }
  }, [isQuoteError, navigate, toast]);
  
  if (isLoadingQuote) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!quote) {
    return null;
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
      
      <QuoteHeader 
        quote={quote} 
        onSave={handleSaveQuote}
        onExport={handleExport}
        isSaving={saveQuoteMutation.isPending}
        isExporting={isExporting}
      />
      
      <Card className="bg-white rounded-lg shadow-sm mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="configuration"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <span className="bg-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
              Configuration
            </TabsTrigger>
            <TabsTrigger 
              value="specifications"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <span className={`${activeTab === 'specifications' || activeTab === 'summary' ? 'bg-primary text-white' : 'bg-[#E2E8F0] text-[#718096]'} rounded-full w-6 h-6 inline-flex items-center justify-center mr-2`}>2</span>
              Specifications
            </TabsTrigger>
            <TabsTrigger 
              value="summary"
              className="px-4 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
            >
              <span className={`${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-[#E2E8F0] text-[#718096]'} rounded-full w-6 h-6 inline-flex items-center justify-center mr-2`}>3</span>
              Summary
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ComponentSelector 
                  quoteId={quote.id} 
                  components={components || []} 
                  isLoading={isLoadingComponents}
                />
                
                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/quotes")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />Back
                  </Button>
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-white"
                    onClick={handleNextStep}
                  >
                    Next<ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <QuoteSummary 
                  quote={quote}
                  components={components || []} 
                  isLoading={isLoadingComponents}
                  onSave={handleSaveQuote}
                  onExport={handleExport}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications">
            <div className="p-6">
              <h3 className="text-xl font-medium mb-4">Project Specifications & Planning</h3>
              
              <Tabs defaultValue="timeline" className="mt-6">
                <TabsList className="mb-4">
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Timeline Estimation
                  </TabsTrigger>
                  <TabsTrigger value="vendors" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Vendors & Contractors
                  </TabsTrigger>
                  <TabsTrigger value="site" className="flex items-center gap-2">
                    <Map className="h-4 w-4" /> Site-Specific Factors
                  </TabsTrigger>
                  <TabsTrigger value="operational" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" /> Operational Costs
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="mt-4">
                  <TimelineEstimator 
                    timeline={{
                      phases: quote.timeline?.phases || [],
                      totalDuration: quote.timeline?.totalDuration || 0,
                      contingencyDays: quote.timeline?.contingencyDays || 0,
                      weatherContingencyDays: quote.timeline?.weatherContingencyDays || 0,
                      startDate: quote.timeline?.startDate || new Date().toISOString(),
                      estimatedCompletionDate: quote.timeline?.estimatedCompletionDate || new Date().toISOString()
                    }}
                    onChange={(timeline) => {
                      saveQuoteMutation.mutate({
                        ...quote,
                        timeline
                      });
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="vendors" className="mt-4">
                  <VendorManager 
                    vendors={Array.isArray(quote.vendors) ? quote.vendors : []}
                    onChange={(vendors) => {
                      saveQuoteMutation.mutate({
                        ...quote,
                        vendors
                      });
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="site" className="mt-4">
                  <SiteFactorsAnalyzer 
                    siteFactors={{
                      soilCondition: quote.siteSpecificFactors?.soilCondition || {
                        type: "",
                        contaminationLevel: "none",
                        extraCosts: 0
                      },
                      groundwater: quote.siteSpecificFactors?.groundwater || {
                        level: 0,
                        requiresDewatering: false,
                        dewateringCost: 0
                      },
                      utilities: quote.siteSpecificFactors?.utilities || {
                        electricalConnection: {
                          distance: 0,
                          costPerFoot: 0,
                          totalCost: 0
                        }
                      },
                      zoningRequirements: quote.siteSpecificFactors?.zoningRequirements || [],
                      environmentalConcerns: quote.siteSpecificFactors?.environmentalConcerns || []
                    }}
                    onChange={(siteFactors) => {
                      saveQuoteMutation.mutate({
                        ...quote,
                        siteSpecificFactors: siteFactors
                      });
                    }}
                  />
                </TabsContent>
                
                <TabsContent value="operational" className="mt-4">
                  <OperationalCostCalculator 
                    operationalCosts={{
                      maintenance: quote.operationalCosts?.maintenance || {
                        annual: 0,
                        fiveYear: 0,
                        tenYear: 0
                      },
                      utilities: quote.operationalCosts?.utilities || {
                        electricity: {
                          monthlyKwh: 0,
                          monthlyCost: 0,
                          annualCost: 0
                        }
                      },
                      totalAnnualOperatingCost: quote.operationalCosts?.totalAnnualOperatingCost || 0
                    }}
                    onChange={(operationalCosts) => {
                      saveQuoteMutation.mutate({
                        ...quote,
                        operationalCosts
                      });
                    }}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />Back
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleNextStep}
                >
                  Next<ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="p-6">
              <h3 className="text-xl font-medium mb-4">Quote Summary Review</h3>
              
              {/* Project-wide Manpower Summary */}
              <ManpowerSummary 
                components={components || []} 
                isLoading={isLoadingComponents}
              />
              
              {/* Quote Summary Components */}
              <div className="mt-8">
                <h4 className="text-lg font-medium mb-4">Quote Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Client</dt>
                      <dd className="font-medium">{quote.client}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Location</dt>
                      <dd className="font-medium">{quote.location}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Expected Completion</dt>
                      <dd className="font-medium">{quote.completionDate ? new Date(quote.completionDate).toLocaleDateString() : 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-600">Quote Status</dt>
                      <dd className="font-medium">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Draft
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Extended Summary Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Timeline Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium flex items-center mb-3">
                    <Clock className="h-5 w-5 mr-2 text-primary" />
                    Project Timeline
                  </h4>
                  
                  {quote.timeline && Array.isArray(quote.timeline.phases) && quote.timeline.phases.length > 0 ? (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Duration:</span>
                        <span className="font-medium">{quote.timeline.totalDuration} days</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">With Contingency:</span>
                        <span className="font-medium">
                          {quote.timeline.totalDuration + 
                           quote.timeline.contingencyDays + 
                           quote.timeline.weatherContingencyDays} days
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {new Date(quote.timeline.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Completion Date:</span>
                        <span className="font-medium">
                          {new Date(quote.timeline.estimatedCompletionDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="text-sm text-gray-600">Critical Path:</span>
                        <div className="mt-1">
                          {quote.timeline.phases
                            .filter((phase: { criticalPath?: boolean }) => phase.criticalPath)
                            .map((phase: { id: string, name: string, duration: number }, index: number) => (
                              <div key={phase.id} className="text-sm">
                                {index + 1}. {phase.name} ({phase.duration} days)
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Timeline estimation not provided yet
                    </div>
                  )}
                </div>
                
                {/* Vendors Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium flex items-center mb-3">
                    <Briefcase className="h-5 w-5 mr-2 text-primary" />
                    Vendors & Contractors
                  </h4>
                  
                  {quote.vendors && Array.isArray(quote.vendors) && quote.vendors.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">Selected vendors:</div>
                      {quote.vendors.map((vendor: { id: string, name: string, specialties: string[], ratings?: number }) => (
                        <div key={vendor.id} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-xs text-gray-500">{vendor.specialties.join(', ')}</div>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star} className={`text-${star <= (vendor.ratings || 0) ? 'yellow' : 'gray'}-400`}>★</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No vendors assigned to this project
                    </div>
                  )}
                </div>
                
                {/* Site Factors Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium flex items-center mb-3">
                    <Map className="h-5 w-5 mr-2 text-primary" />
                    Site-Specific Factors
                  </h4>
                  
                  {quote.siteSpecificFactors && quote.siteSpecificFactors.soilCondition ? (
                    <div className="space-y-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Soil Type:</span>
                        <span className="font-medium">
                          {quote.siteSpecificFactors.soilCondition?.type || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Contamination:</span>
                        <span className="font-medium">
                          {quote.siteSpecificFactors.soilCondition?.contaminationLevel || 'None'}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Zoning Requirements:</span>
                        <span className="font-medium">
                          {quote.siteSpecificFactors.zoningRequirements?.length || 0} identified
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Environmental Concerns:</span>
                        <span className="font-medium">
                          {quote.siteSpecificFactors.environmentalConcerns?.length || 0} identified
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Additional Site Costs:</span>
                        <span className="font-medium">
                          ${(
                            (quote.siteSpecificFactors.soilCondition?.extraCosts || 0) +
                            (quote.siteSpecificFactors.groundwater?.dewateringCost || 0) +
                            (quote.siteSpecificFactors.utilities?.electricalConnection?.totalCost || 0) +
                            (quote.siteSpecificFactors.utilities?.waterConnection?.totalCost || 0) +
                            (quote.siteSpecificFactors.utilities?.sewerConnection?.totalCost || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Site-specific factors not analyzed yet
                    </div>
                  )}
                </div>
                
                {/* Operational Costs Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium flex items-center mb-3">
                    <Calculator className="h-5 w-5 mr-2 text-primary" />
                    Operational Costs
                  </h4>
                  
                  {quote.operationalCosts && quote.operationalCosts.maintenance && quote.operationalCosts.utilities ? (
                    <div className="space-y-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Annual Operating Cost:</span>
                        <span className="font-medium">
                          ${quote.operationalCosts.totalAnnualOperatingCost.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Operating Cost:</span>
                        <span className="font-medium">
                          ${(quote.operationalCosts.totalAnnualOperatingCost / 12).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Maintenance (Annual):</span>
                        <span className="font-medium">
                          ${quote.operationalCosts.maintenance.annual.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Utilities (Annual):</span>
                        <span className="font-medium">
                          ${(
                            (quote.operationalCosts.utilities.electricity.annualCost) +
                            (quote.operationalCosts.utilities.water?.annualCost || 0) +
                            (quote.operationalCosts.utilities.sewage?.annualCost || 0) +
                            (quote.operationalCosts.utilities.internet?.annualCost || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                      {quote.operationalCosts.estimatedAnnualRevenue ? (
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-gray-600">Estimated Breakeven:</span>
                          <span className="font-medium">
                            {quote.operationalCosts.estimatedBreakeven} months
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Operational costs not projected yet
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button 
                  variant="outline" 
                  onClick={handlePrevStep}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />Back
                </Button>
                <Button 
                  className="bg-[#4CAF50] hover:bg-[#4CAF50]/90 text-white"
                  onClick={handleSaveQuote}
                >
                  Save Quote
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
