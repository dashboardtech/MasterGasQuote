import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteSpecificFactors } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface SiteFactorsAnalyzerProps {
  siteFactors: SiteSpecificFactors;
  onChange: (siteFactors: SiteSpecificFactors) => void;
}

export function SiteFactorsAnalyzer({ siteFactors, onChange }: SiteFactorsAnalyzerProps) {
  const soilTypes = [
    "Sandy", "Clay", "Loam", "Silt", "Rock", "Gravel", "Fill"
  ];
  
  const environmentalConcernOptions = [
    "Wetlands Proximity",
    "Protected Species Habitat",
    "Historical/Cultural Sites",
    "Floodplain Restrictions",
    "Air Quality Requirements",
    "Water Quality Protection",
    "Noise Restrictions",
    "Light Pollution Controls"
  ];
  
  const zoningRequirementOptions = [
    "Commercial Zoning",
    "Industrial Zoning",
    "Special Use Permit",
    "Setback Requirements",
    "Height Restrictions",
    "Signage Restrictions",
    "Landscaping Requirements",
    "Parking Requirements",
    "Stormwater Management"
  ];
  
  // Update soil condition
  const updateSoilCondition = (field: string, value: any) => {
    const currentSoilCondition = siteFactors.soilCondition || { 
      type: 'Clay', 
      contaminationLevel: 'none',
      permeability: 'Low',
      stability: 'Good',
      extraCosts: 0
    };
    
    const updatedSiteFactors = {
      ...siteFactors,
      soilCondition: {
        ...currentSoilCondition,
        [field]: value
      }
    };
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Update groundwater info
  const updateGroundwater = (field: string, value: any) => {
    const currentGroundwater = siteFactors.groundwater || {
      level: 10,
      quality: 'Clean',
      requiresDewatering: false,
      dewateringCost: 0
    };
    
    const updatedSiteFactors = {
      ...siteFactors,
      groundwater: {
        ...currentGroundwater,
        [field]: value
      }
    };
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Update utilities
  const updateUtility = (utilityType: string, field: string, value: any) => {
    const utilities = siteFactors.utilities || {
      electricalConnection: {
        distance: 0,
        costPerFoot: 0,
        totalCost: 0
      }
    };
    
    let updatedUtility: any;
    
    if (utilityType === 'electrical') {
      updatedUtility = {
        ...utilities,
        electricalConnection: {
          ...utilities.electricalConnection,
          [field]: value
        }
      };
      
      // If distance or costPerFoot changes, recalculate totalCost
      if (field === 'distance' || field === 'costPerFoot') {
        const distance = field === 'distance' ? value : utilities.electricalConnection.distance;
        const costPerFoot = field === 'costPerFoot' ? value : utilities.electricalConnection.costPerFoot;
        updatedUtility.electricalConnection.totalCost = distance * costPerFoot;
      }
    } else if (utilityType === 'water') {
      updatedUtility = {
        ...utilities,
        waterConnection: {
          ...utilities.waterConnection,
          [field]: value
        }
      };
      
      // If distance or costPerFoot changes, recalculate totalCost
      if (field === 'distance' || field === 'costPerFoot') {
        const waterConn = utilities.waterConnection || { distance: 0, costPerFoot: 0, totalCost: 0 };
        const distance = field === 'distance' ? value : waterConn.distance;
        const costPerFoot = field === 'costPerFoot' ? value : waterConn.costPerFoot;
        updatedUtility.waterConnection.totalCost = distance * costPerFoot;
      }
    } else if (utilityType === 'sewer') {
      updatedUtility = {
        ...utilities,
        sewerConnection: {
          ...utilities.sewerConnection,
          [field]: value
        }
      };
      
      // If distance or costPerFoot changes, recalculate totalCost
      if (field === 'distance' || field === 'costPerFoot') {
        const sewerConn = utilities.sewerConnection || { distance: 0, costPerFoot: 0, totalCost: 0 };
        const distance = field === 'distance' ? value : sewerConn.distance;
        const costPerFoot = field === 'costPerFoot' ? value : sewerConn.costPerFoot;
        updatedUtility.sewerConnection.totalCost = distance * costPerFoot;
      }
    }
    
    const updatedSiteFactors = {
      ...siteFactors,
      utilities: updatedUtility
    };
    
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Update traffic flow
  const updateTrafficFlow = (field: string, value: any) => {
    const currentTrafficFlow = siteFactors.trafficFlow || {
      currentDailyTraffic: 0,
      peakHourVolume: 0,
      requiredLanes: 0,
      entryPointCount: 0,
      exitPointCount: 0
    };
    
    const updatedSiteFactors = {
      ...siteFactors,
      trafficFlow: {
        ...currentTrafficFlow,
        [field]: value
      }
    };
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Toggle zoning requirement
  const toggleZoningRequirement = (requirement: string) => {
    const currentRequirements = siteFactors.zoningRequirements || [];
    let updatedRequirements: string[];
    
    if (currentRequirements.includes(requirement)) {
      updatedRequirements = currentRequirements.filter(r => r !== requirement);
    } else {
      updatedRequirements = [...currentRequirements, requirement];
    }
    
    const updatedSiteFactors = {
      ...siteFactors,
      zoningRequirements: updatedRequirements
    };
    
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Toggle environmental concern
  const toggleEnvironmentalConcern = (concern: string) => {
    const currentConcerns = siteFactors.environmentalConcerns || [];
    let updatedConcerns: string[];
    
    if (currentConcerns.includes(concern)) {
      updatedConcerns = currentConcerns.filter(c => c !== concern);
    } else {
      updatedConcerns = [...currentConcerns, concern];
    }
    
    const updatedSiteFactors = {
      ...siteFactors,
      environmentalConcerns: updatedConcerns
    };
    
    onChange(updatedSiteFactors as SiteSpecificFactors);
  };
  
  // Calculate total utility costs
  const calculateTotalUtilityCost = () => {
    const utilities = siteFactors.utilities || { 
      electricalConnection: { totalCost: 0 } 
    };
    
    // Safely access properties
    const electricalCost = utilities.electricalConnection?.totalCost || 0;
    
    // Since waterConnection and sewerConnection might not exist on the utilities type,
    // use optional chaining and nullish coalescing to safely access them
    const waterConnection = 'waterConnection' in utilities ? utilities.waterConnection : undefined;
    const sewerConnection = 'sewerConnection' in utilities ? utilities.sewerConnection : undefined;
    
    const waterCost = waterConnection?.totalCost || 0;
    const sewerCost = sewerConnection?.totalCost || 0;
    
    return electricalCost + waterCost + sewerCost;
  };
  
  // Calculate total site factors cost
  const calculateTotalSiteFactorsCost = () => {
    const soilExtraCosts = siteFactors.soilCondition?.extraCosts || 0;
    const dewateringCost = siteFactors.groundwater?.dewateringCost || 0;
    const utilityCost = calculateTotalUtilityCost();
    
    return soilExtraCosts + dewateringCost + utilityCost;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Site-Specific Factors Analysis</CardTitle>
          <CardDescription>
            Analyze site conditions that may affect construction costs and timeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="soil" className="space-y-4">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="soil">Soil Conditions</TabsTrigger>
              <TabsTrigger value="groundwater">Groundwater</TabsTrigger>
              <TabsTrigger value="utilities">Utilities</TabsTrigger>
              <TabsTrigger value="traffic">Traffic Flow</TabsTrigger>
              <TabsTrigger value="regulations">Regulations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="soil" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="soilType">Soil Type</Label>
                  <Select 
                    value={siteFactors.soilCondition?.type || ""} 
                    onValueChange={(value) => updateSoilCondition('type', value)}
                  >
                    <SelectTrigger id="soilType">
                      <SelectValue placeholder="Select soil type" />
                    </SelectTrigger>
                    <SelectContent>
                      {soilTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contamination">Contamination Level</Label>
                  <Select 
                    value={siteFactors.soilCondition?.contaminationLevel || "none"} 
                    onValueChange={(value) => updateSoilCondition('contaminationLevel', value)}
                  >
                    <SelectTrigger id="contamination">
                      <SelectValue placeholder="Select contamination level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="permeability">Soil Permeability</Label>
                  <Input 
                    id="permeability" 
                    value={siteFactors.soilCondition?.permeability || ""} 
                    onChange={(e) => updateSoilCondition('permeability', e.target.value)}
                    placeholder="e.g., Low, Medium, High"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stability">Soil Stability</Label>
                  <Input 
                    id="stability" 
                    value={siteFactors.soilCondition?.stability || ""} 
                    onChange={(e) => updateSoilCondition('stability', e.target.value)}
                    placeholder="e.g., Poor, Fair, Good"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="extraCosts">Additional Soil Remediation Costs ($)</Label>
                <Input 
                  id="extraCosts" 
                  type="number"
                  value={siteFactors.soilCondition?.extraCosts || 0} 
                  onChange={(e) => updateSoilCondition('extraCosts', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="groundwater" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groundwaterLevel">Groundwater Level (feet)</Label>
                  <Input 
                    id="groundwaterLevel" 
                    type="number"
                    value={siteFactors.groundwater?.level || 0} 
                    onChange={(e) => updateGroundwater('level', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="waterQuality">Groundwater Quality</Label>
                  <Input 
                    id="waterQuality" 
                    value={siteFactors.groundwater?.quality || ""} 
                    onChange={(e) => updateGroundwater('quality', e.target.value)}
                    placeholder="e.g., Clean, Contaminated"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiresDewatering">Requires Dewatering</Label>
                  <Select 
                    value={siteFactors.groundwater?.requiresDewatering ? "yes" : "no"} 
                    onValueChange={(value) => updateGroundwater('requiresDewatering', value === "yes")}
                  >
                    <SelectTrigger id="requiresDewatering">
                      <SelectValue placeholder="Does site require dewatering?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dewateringCost">Dewatering Cost ($)</Label>
                  <Input 
                    id="dewateringCost" 
                    type="number"
                    value={siteFactors.groundwater?.dewateringCost || 0} 
                    onChange={(e) => updateGroundwater('dewateringCost', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    disabled={!siteFactors.groundwater?.requiresDewatering}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="utilities" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Electrical Connection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="electricalDistance">Distance (feet)</Label>
                    <Input 
                      id="electricalDistance" 
                      type="number"
                      value={siteFactors.utilities?.electricalConnection.distance || 0} 
                      onChange={(e) => updateUtility('electrical', 'distance', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricalCost">Cost Per Foot ($)</Label>
                    <Input 
                      id="electricalCost" 
                      type="number"
                      value={siteFactors.utilities?.electricalConnection.costPerFoot || 0} 
                      onChange={(e) => updateUtility('electrical', 'costPerFoot', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricalTotal">Total Cost ($)</Label>
                    <Input 
                      id="electricalTotal" 
                      type="text"
                      value={formatCurrency(siteFactors.utilities?.electricalConnection.totalCost || 0)} 
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Water Connection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="waterDistance">Distance (feet)</Label>
                    <Input 
                      id="waterDistance" 
                      type="number"
                      value={siteFactors.utilities?.waterConnection?.distance || 0} 
                      onChange={(e) => updateUtility('water', 'distance', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waterCost">Cost Per Foot ($)</Label>
                    <Input 
                      id="waterCost" 
                      type="number"
                      value={siteFactors.utilities?.waterConnection?.costPerFoot || 0} 
                      onChange={(e) => updateUtility('water', 'costPerFoot', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waterTotal">Total Cost ($)</Label>
                    <Input 
                      id="waterTotal" 
                      type="text"
                      value={formatCurrency(siteFactors.utilities?.waterConnection?.totalCost || 0)} 
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Sewer Connection</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sewerDistance">Distance (feet)</Label>
                    <Input 
                      id="sewerDistance" 
                      type="number"
                      value={siteFactors.utilities?.sewerConnection?.distance || 0} 
                      onChange={(e) => updateUtility('sewer', 'distance', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sewerCost">Cost Per Foot ($)</Label>
                    <Input 
                      id="sewerCost" 
                      type="number"
                      value={siteFactors.utilities?.sewerConnection?.costPerFoot || 0} 
                      onChange={(e) => updateUtility('sewer', 'costPerFoot', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sewerTotal">Total Cost ($)</Label>
                    <Input 
                      id="sewerTotal" 
                      type="text"
                      value={formatCurrency(siteFactors.utilities?.sewerConnection?.totalCost || 0)} 
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg mt-4">
                <h3 className="font-medium">Total Utilities Connection Cost</h3>
                <p className="text-2xl font-bold">{formatCurrency(calculateTotalUtilityCost())}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="traffic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentTraffic">Current Daily Traffic (vehicles)</Label>
                  <Input 
                    id="currentTraffic" 
                    type="number"
                    value={siteFactors.trafficFlow?.currentDailyTraffic || 0} 
                    onChange={(e) => updateTrafficFlow('currentDailyTraffic', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="peakVolume">Peak Hour Volume (vehicles)</Label>
                  <Input 
                    id="peakVolume" 
                    type="number"
                    value={siteFactors.trafficFlow?.peakHourVolume || 0} 
                    onChange={(e) => updateTrafficFlow('peakHourVolume', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requiredLanes">Required Lanes</Label>
                  <Input 
                    id="requiredLanes" 
                    type="number"
                    value={siteFactors.trafficFlow?.requiredLanes || 0} 
                    onChange={(e) => updateTrafficFlow('requiredLanes', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="entryPoints">Entry Points</Label>
                  <Input 
                    id="entryPoints" 
                    type="number"
                    value={siteFactors.trafficFlow?.entryPointCount || 0} 
                    onChange={(e) => updateTrafficFlow('entryPointCount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exitPoints">Exit Points</Label>
                  <Input 
                    id="exitPoints" 
                    type="number"
                    value={siteFactors.trafficFlow?.exitPointCount || 0} 
                    onChange={(e) => updateTrafficFlow('exitPointCount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="regulations" className="space-y-6">
              <div className="space-y-4">
                <Label>Zoning Requirements</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {zoningRequirementOptions.map(requirement => (
                    <div key={requirement} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`zoning-${requirement}`}
                        checked={(siteFactors.zoningRequirements || []).includes(requirement)}
                        onChange={() => toggleZoningRequirement(requirement)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`zoning-${requirement}`} className="text-sm font-normal">
                        {requirement}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <Label>Environmental Concerns</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {environmentalConcernOptions.map(concern => (
                    <div key={concern} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`env-${concern}`}
                        checked={(siteFactors.environmentalConcerns || []).includes(concern)}
                        onChange={() => toggleEnvironmentalConcern(concern)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`env-${concern}`} className="text-sm font-normal">
                        {concern}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="font-medium">Total Site-Specific Additional Cost</h3>
            <p className="text-2xl font-bold">{formatCurrency(calculateTotalSiteFactorsCost())}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Including soil remediation, dewatering, and utility connections
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}