import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Trash2, PlusCircle } from "lucide-react";
import { OperationalCostProjection } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface OperationalCostCalculatorProps {
  operationalCosts: OperationalCostProjection;
  onChange: (operationalCosts: OperationalCostProjection) => void;
}

export function OperationalCostCalculator({ operationalCosts, onChange }: OperationalCostCalculatorProps) {
  const [newSystemBreakdown, setNewSystemBreakdown] = useState({ system: "", cost: 0 });
  const [newStaffPosition, setNewStaffPosition] = useState({ 
    title: "", 
    count: 1, 
    annualSalary: 0, 
    benefits: 0 
  });
  
  // Update maintenance costs
  const updateMaintenanceCost = (field: string, value: number | string) => {
    const updatedOperationalCosts = {
      ...operationalCosts,
      maintenance: {
        ...operationalCosts.maintenance,
        [field]: value
      }
    };
    
    // Recalculate total annual operating cost
    updatedOperationalCosts.totalAnnualOperatingCost = calculateTotalAnnualCost(updatedOperationalCosts);
    
    onChange(updatedOperationalCosts);
  };
  
  // Update utility costs
  const updateUtilityCost = (utilityType: string, field: string, value: number) => {
    let updatedUtilities = { ...operationalCosts.utilities };
    
    if (utilityType === 'electricity') {
      updatedUtilities = {
        ...updatedUtilities,
        electricity: {
          ...updatedUtilities.electricity,
          [field]: value
        }
      };
      
      // If monthly cost changes, update annual cost
      if (field === 'monthlyCost') {
        updatedUtilities.electricity.annualCost = value * 12;
      }
    } else if (utilityType === 'water') {
      updatedUtilities = {
        ...updatedUtilities,
        water: {
          ...(updatedUtilities.water || { 
            monthlyGallons: 0, 
            monthlyCost: 0, 
            annualCost: 0 
          }),
          [field]: value
        }
      };
      
      // If monthly cost changes, update annual cost
      if (field === 'monthlyCost') {
        if (!updatedUtilities.water) {
          updatedUtilities.water = { 
            monthlyGallons: 0, 
            monthlyCost: value, 
            annualCost: value * 12 
          };
        } else {
          updatedUtilities.water.annualCost = value * 12;
        }
      }
    } else if (utilityType === 'sewage') {
      updatedUtilities = {
        ...updatedUtilities,
        sewage: {
          ...(updatedUtilities.sewage || { 
            monthlyCost: 0, 
            annualCost: 0 
          }),
          [field]: value
        }
      };
      
      // If monthly cost changes, update annual cost
      if (field === 'monthlyCost') {
        if (!updatedUtilities.sewage) {
          updatedUtilities.sewage = { 
            monthlyCost: value, 
            annualCost: value * 12 
          };
        } else {
          updatedUtilities.sewage.annualCost = value * 12;
        }
      }
    } else if (utilityType === 'internet') {
      updatedUtilities = {
        ...updatedUtilities,
        internet: {
          ...(updatedUtilities.internet || { 
            monthlyCost: 0, 
            annualCost: 0 
          }),
          [field]: value
        }
      };
      
      // If monthly cost changes, update annual cost
      if (field === 'monthlyCost') {
        if (!updatedUtilities.internet) {
          updatedUtilities.internet = { 
            monthlyCost: value, 
            annualCost: value * 12 
          };
        } else {
          updatedUtilities.internet.annualCost = value * 12;
        }
      }
    }
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      utilities: updatedUtilities
    };
    
    // Recalculate total annual operating cost
    updatedOperationalCosts.totalAnnualOperatingCost = calculateTotalAnnualCost(updatedOperationalCosts);
    
    onChange(updatedOperationalCosts);
  };
  
  // Update insurance costs
  const updateInsuranceCost = (field: string, value: number) => {
    const currentInsurance = operationalCosts.insurance || {
      liability: 0,
      property: 0,
      workers: 0,
      totalAnnual: 0
    };
    
    const updatedInsurance = {
      ...currentInsurance,
      [field]: value
    };
    
    // Recalculate total annual insurance cost
    updatedInsurance.totalAnnual = 
      updatedInsurance.liability + 
      updatedInsurance.property + 
      updatedInsurance.workers;
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      insurance: updatedInsurance
    };
    
    // Recalculate total annual operating cost
    updatedOperationalCosts.totalAnnualOperatingCost = calculateTotalAnnualCost(updatedOperationalCosts);
    
    onChange(updatedOperationalCosts);
  };
  
  // Add system to maintenance breakdown
  const addSystemBreakdown = () => {
    if (!newSystemBreakdown.system || !newSystemBreakdown.cost) return;
    
    const currentBreakdown = operationalCosts.maintenance.breakdownBySystem || {};
    const updatedBreakdown = {
      ...currentBreakdown,
      [newSystemBreakdown.system]: newSystemBreakdown.cost
    };
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      maintenance: {
        ...operationalCosts.maintenance,
        breakdownBySystem: updatedBreakdown
      }
    };
    
    onChange(updatedOperationalCosts);
    setNewSystemBreakdown({ system: "", cost: 0 });
  };
  
  // Remove system from maintenance breakdown
  const removeSystemBreakdown = (system: string) => {
    const currentBreakdown = operationalCosts.maintenance.breakdownBySystem || {};
    const { [system]: removedSystem, ...updatedBreakdown } = currentBreakdown;
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      maintenance: {
        ...operationalCosts.maintenance,
        breakdownBySystem: updatedBreakdown
      }
    };
    
    onChange(updatedOperationalCosts);
  };
  
  // Add staff position
  const addStaffPosition = () => {
    if (!newStaffPosition.title || !newStaffPosition.annualSalary) return;
    
    const currentStaffing = operationalCosts.staffing || {
      positions: [],
      totalAnnualCost: 0
    };
    
    const updatedPositions = [...currentStaffing.positions, { ...newStaffPosition }];
    
    // Calculate total staffing cost
    const totalStaffingCost = updatedPositions.reduce((total, position) => {
      return total + (position.count * (position.annualSalary + position.benefits));
    }, 0);
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      staffing: {
        positions: updatedPositions,
        totalAnnualCost: totalStaffingCost
      }
    };
    
    // Recalculate total annual operating cost
    updatedOperationalCosts.totalAnnualOperatingCost = calculateTotalAnnualCost(updatedOperationalCosts);
    
    onChange(updatedOperationalCosts);
    setNewStaffPosition({ title: "", count: 1, annualSalary: 0, benefits: 0 });
  };
  
  // Remove staff position
  const removeStaffPosition = (index: number) => {
    const currentStaffing = operationalCosts.staffing;
    if (!currentStaffing) return;
    
    const updatedPositions = [...currentStaffing.positions];
    updatedPositions.splice(index, 1);
    
    // Calculate total staffing cost
    const totalStaffingCost = updatedPositions.reduce((total, position) => {
      return total + (position.count * (position.annualSalary + position.benefits));
    }, 0);
    
    const updatedOperationalCosts = {
      ...operationalCosts,
      staffing: {
        positions: updatedPositions,
        totalAnnualCost: totalStaffingCost
      }
    };
    
    // Recalculate total annual operating cost
    updatedOperationalCosts.totalAnnualOperatingCost = calculateTotalAnnualCost(updatedOperationalCosts);
    
    onChange(updatedOperationalCosts);
  };
  
  // Update revenue and breakeven
  const updateRevenue = (value: number) => {
    const updatedOperationalCosts = {
      ...operationalCosts,
      estimatedAnnualRevenue: value
    };
    
    // Calculate breakeven if we have revenue
    if (value > 0) {
      const monthlyCost = operationalCosts.totalAnnualOperatingCost / 12;
      const monthlyRevenue = value / 12;
      const breakeven = Math.ceil(monthlyCost / monthlyRevenue * 12);
      
      updatedOperationalCosts.estimatedBreakeven = breakeven;
    }
    
    onChange(updatedOperationalCosts);
  };
  
  // Calculate total annual cost from all categories
  const calculateTotalAnnualCost = (costs: OperationalCostProjection): number => {
    const maintenanceCost = costs.maintenance.annual;
    
    // Utility costs
    const electricityCost = costs.utilities.electricity.annualCost;
    const waterCost = costs.utilities.water?.annualCost || 0;
    const sewageCost = costs.utilities.sewage?.annualCost || 0;
    const internetCost = costs.utilities.internet?.annualCost || 0;
    
    // Staffing and insurance
    const staffingCost = costs.staffing?.totalAnnualCost || 0;
    const insuranceCost = costs.insurance?.totalAnnual || 0;
    
    return maintenanceCost + electricityCost + waterCost + sewageCost + 
           internetCost + staffingCost + insuranceCost;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Operational Cost Projections</CardTitle>
          <CardDescription>
            Estimate ongoing operational costs for the gas station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="maintenance" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="utilities">Utilities</TabsTrigger>
              <TabsTrigger value="staffing">Staffing</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="maintenance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annualMaintenance">Annual Maintenance Cost ($)</Label>
                  <Input 
                    id="annualMaintenance" 
                    type="number"
                    value={operationalCosts.maintenance.annual || 0} 
                    onChange={(e) => updateMaintenanceCost('annual', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fiveYearMaintenance">5-Year Maintenance Cost ($)</Label>
                  <Input 
                    id="fiveYearMaintenance" 
                    type="number"
                    value={operationalCosts.maintenance.fiveYear || 0} 
                    onChange={(e) => updateMaintenanceCost('fiveYear', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tenYearMaintenance">10-Year Maintenance Cost ($)</Label>
                  <Input 
                    id="tenYearMaintenance" 
                    type="number"
                    value={operationalCosts.maintenance.tenYear || 0} 
                    onChange={(e) => updateMaintenanceCost('tenYear', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maintenanceDescription">Maintenance Description</Label>
                <Input 
                  id="maintenanceDescription" 
                  value={operationalCosts.maintenance.description || ""} 
                  onChange={(e) => updateMaintenanceCost('description', e.target.value)}
                  placeholder="Brief description of maintenance schedule and activities"
                />
              </div>
              
              <div className="space-y-4">
                <Label>System-by-System Breakdown</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-2">
                  <div className="md:col-span-8">
                    <Input 
                      placeholder="System Name (e.g., Fuel Dispensers, Tanks, etc.)" 
                      value={newSystemBreakdown.system}
                      onChange={(e) => setNewSystemBreakdown({ ...newSystemBreakdown, system: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Input 
                      type="number"
                      placeholder="Annual Cost ($)" 
                      value={newSystemBreakdown.cost || ""} 
                      onChange={(e) => setNewSystemBreakdown({ ...newSystemBreakdown, cost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <Button onClick={addSystemBreakdown} size="sm" className="w-full h-full">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {operationalCosts.maintenance.breakdownBySystem && 
                 Object.keys(operationalCosts.maintenance.breakdownBySystem).length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>System</TableHead>
                        <TableHead className="text-right">Annual Cost</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(operationalCosts.maintenance.breakdownBySystem).map(([system, cost]) => (
                        <TableRow key={system}>
                          <TableCell>{system}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cost)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeSystemBreakdown(system)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No systems added yet. Add maintenance costs by system above.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="utilities" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Electricity</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyKwh">Monthly Usage (kWh)</Label>
                    <Input 
                      id="monthlyKwh" 
                      type="number"
                      value={operationalCosts.utilities.electricity.monthlyKwh || 0} 
                      onChange={(e) => updateUtilityCost('electricity', 'monthlyKwh', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricityMonthlyCost">Monthly Cost ($)</Label>
                    <Input 
                      id="electricityMonthlyCost" 
                      type="number"
                      value={operationalCosts.utilities.electricity.monthlyCost || 0} 
                      onChange={(e) => updateUtilityCost('electricity', 'monthlyCost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="electricityAnnualCost">Annual Cost ($)</Label>
                    <Input 
                      id="electricityAnnualCost" 
                      type="text"
                      value={formatCurrency(operationalCosts.utilities.electricity.annualCost || 0)} 
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Water</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyGallons">Monthly Usage (gallons)</Label>
                    <Input 
                      id="monthlyGallons" 
                      type="number"
                      value={operationalCosts.utilities.water?.monthlyGallons || 0} 
                      onChange={(e) => updateUtilityCost('water', 'monthlyGallons', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waterMonthlyCost">Monthly Cost ($)</Label>
                    <Input 
                      id="waterMonthlyCost" 
                      type="number"
                      value={operationalCosts.utilities.water?.monthlyCost || 0} 
                      onChange={(e) => updateUtilityCost('water', 'monthlyCost', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="waterAnnualCost">Annual Cost ($)</Label>
                    <Input 
                      id="waterAnnualCost" 
                      type="text"
                      value={formatCurrency(operationalCosts.utilities.water?.annualCost || 0)} 
                      disabled
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Sewage</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sewageMonthlyCost">Monthly Cost ($)</Label>
                      <Input 
                        id="sewageMonthlyCost" 
                        type="number"
                        value={operationalCosts.utilities.sewage?.monthlyCost || 0} 
                        onChange={(e) => updateUtilityCost('sewage', 'monthlyCost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="sewageAnnualCost">Annual Cost ($)</Label>
                      <Input 
                        id="sewageAnnualCost" 
                        type="text"
                        value={formatCurrency(operationalCosts.utilities.sewage?.annualCost || 0)} 
                        disabled
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Internet & Communications</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="internetMonthlyCost">Monthly Cost ($)</Label>
                      <Input 
                        id="internetMonthlyCost" 
                        type="number"
                        value={operationalCosts.utilities.internet?.monthlyCost || 0} 
                        onChange={(e) => updateUtilityCost('internet', 'monthlyCost', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="internetAnnualCost">Annual Cost ($)</Label>
                      <Input 
                        id="internetAnnualCost" 
                        type="text"
                        value={formatCurrency(operationalCosts.utilities.internet?.annualCost || 0)} 
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="staffing" className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                  <div className="md:col-span-4">
                    <Label htmlFor="positionTitle">Position Title</Label>
                    <Input 
                      id="positionTitle" 
                      placeholder="e.g., Cashier, Manager, etc." 
                      value={newStaffPosition.title}
                      onChange={(e) => setNewStaffPosition({ ...newStaffPosition, title: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="positionCount">Count</Label>
                    <Input 
                      id="positionCount" 
                      type="number"
                      min="1"
                      placeholder="Number of employees" 
                      value={newStaffPosition.count} 
                      onChange={(e) => setNewStaffPosition({ ...newStaffPosition, count: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <Label htmlFor="positionSalary">Annual Salary ($)</Label>
                    <Input 
                      id="positionSalary" 
                      type="number"
                      placeholder="0.00" 
                      value={newStaffPosition.annualSalary || ""} 
                      onChange={(e) => setNewStaffPosition({ ...newStaffPosition, annualSalary: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="positionBenefits">Benefits ($)</Label>
                    <Input 
                      id="positionBenefits" 
                      type="number"
                      placeholder="0.00" 
                      value={newStaffPosition.benefits || ""} 
                      onChange={(e) => setNewStaffPosition({ ...newStaffPosition, benefits: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button onClick={addStaffPosition} size="sm" className="w-full h-[40px]">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {operationalCosts.staffing?.positions.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Position</TableHead>
                        <TableHead className="text-center">Count</TableHead>
                        <TableHead className="text-right">Annual Salary</TableHead>
                        <TableHead className="text-right">Benefits</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operationalCosts.staffing.positions.map((position, index) => (
                        <TableRow key={index}>
                          <TableCell>{position.title}</TableCell>
                          <TableCell className="text-center">{position.count}</TableCell>
                          <TableCell className="text-right">{formatCurrency(position.annualSalary)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(position.benefits)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(position.count * (position.annualSalary + position.benefits))}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeStaffPosition(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} className="text-right font-medium">
                          Total Annual Staffing Cost:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(operationalCosts.staffing.totalAnnualCost)}
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No staff positions added yet. Add positions using the form above.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="insurance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="liabilityInsurance">Liability Insurance ($)</Label>
                  <Input 
                    id="liabilityInsurance" 
                    type="number"
                    value={operationalCosts.insurance?.liability || 0} 
                    onChange={(e) => updateInsuranceCost('liability', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="propertyInsurance">Property Insurance ($)</Label>
                  <Input 
                    id="propertyInsurance" 
                    type="number"
                    value={operationalCosts.insurance?.property || 0} 
                    onChange={(e) => updateInsuranceCost('property', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workersComp">Workers' Compensation ($)</Label>
                  <Input 
                    id="workersComp" 
                    type="number"
                    value={operationalCosts.insurance?.workers || 0} 
                    onChange={(e) => updateInsuranceCost('workers', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h3 className="font-medium">Total Annual Insurance Cost</h3>
                <p className="text-2xl font-bold">
                  {formatCurrency(operationalCosts.insurance?.totalAnnual || 0)}
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="annualRevenue">Estimated Annual Revenue ($)</Label>
                <Input 
                  id="annualRevenue" 
                  type="number"
                  value={operationalCosts.estimatedAnnualRevenue || 0} 
                  onChange={(e) => updateRevenue(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="breakeven">Estimated Breakeven (months)</Label>
                <Input 
                  id="breakeven" 
                  type="text"
                  value={operationalCosts.estimatedBreakeven || "N/A"} 
                  disabled
                />
              </div>
            </div>
            
            <div className="p-6 bg-primary/10 rounded-lg mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Annual Operating Cost</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(operationalCosts.totalAnnualOperatingCost)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Monthly Operating Cost</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(operationalCosts.totalAnnualOperatingCost / 12)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Operating Margin</h3>
                  <p className="text-3xl font-bold">
                    {operationalCosts.estimatedAnnualRevenue 
                      ? `${((operationalCosts.estimatedAnnualRevenue - operationalCosts.totalAnnualOperatingCost) / 
                          operationalCosts.estimatedAnnualRevenue * 100).toFixed(1)}%` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}