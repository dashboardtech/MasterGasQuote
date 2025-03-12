import React from 'react';
import { Component, ManpowerRequirement } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Users, Clock, BarChart3, FileText } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ManpowerMetrics } from '@/components/ui/manpower-metrics'; 

interface ManpowerSummaryProps {
  components: Component[];
  isLoading: boolean;
}

export default function ManpowerSummary({ components, isLoading }: ManpowerSummaryProps) {
  // Skip if loading or no components
  if (isLoading || components.length === 0) {
    return null;
  }

  // Extract all manpower requirements from all components
  const allManpowerRequirements: ManpowerRequirement[] = components.flatMap(component => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    return configuration.manpower || [];
  });

  // If no manpower requirements, don't show anything
  if (allManpowerRequirements.length === 0) {
    return null;
  }

  // Calculate total hours, cost, and workers
  const totalHours = allManpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + (req.hours * req.quantity), 
    0
  );
  
  const totalCost = allManpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + (req.hourlyRate * req.hours * req.quantity), 
    0
  );
  
  const totalWorkers = allManpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + req.quantity, 
    0
  );

  // Group requirements by role
  const roleGrouped = allManpowerRequirements.reduce((acc, req) => {
    if (!acc[req.role]) {
      acc[req.role] = {
        role: req.role,
        hours: 0,
        cost: 0,
        workers: 0,
        hourlyRate: req.hourlyRate // Use the rate from the first occurrence
      };
    }
    
    acc[req.role].hours += req.hours * req.quantity;
    acc[req.role].cost += req.hourlyRate * req.hours * req.quantity;
    acc[req.role].workers += req.quantity;
    
    return acc;
  }, {} as Record<string, {
    role: string;
    hours: number;
    cost: number;
    workers: number;
    hourlyRate: number;
  }>);

  // Convert to array and sort by cost (highest first)
  const roleSummaries = Object.values(roleGrouped).sort((a, b) => b.cost - a.cost);

  // Group requirements by component
  const componentGrouped = components.reduce((acc, component) => {
    const configuration = typeof component.configuration === 'string' 
      ? JSON.parse(component.configuration) 
      : component.configuration;
    
    const manpower = configuration.manpower || [];
    
    if (manpower.length === 0) {
      return acc;
    }
    
    const componentHours = manpower.reduce(
      (sum: number, req: ManpowerRequirement) => sum + (req.hours * req.quantity), 
      0
    );
    
    const componentCost = manpower.reduce(
      (sum: number, req: ManpowerRequirement) => sum + (req.hourlyRate * req.hours * req.quantity), 
      0
    );
    
    acc.push({
      id: component.id,
      name: component.name,
      type: component.type,
      hours: componentHours,
      cost: componentCost,
      manpower: manpower
    });
    
    return acc;
  }, [] as Array<{
    id: number;
    name: string;
    type: string;
    hours: number;
    cost: number;
    manpower: ManpowerRequirement[];
  }>);

  // Sort components by cost (highest first)
  componentGrouped.sort((a, b) => b.cost - a.cost);

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Users className="mr-2 h-6 w-6" />
          Project Manpower Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 p-4 rounded-lg flex items-center space-x-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Workers</p>
              <p className="text-2xl font-bold">{totalWorkers}</p>
            </div>
          </div>
          <div className="bg-primary/5 p-4 rounded-lg flex items-center space-x-4">
            <Clock className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">{totalHours.toLocaleString()}</p>
            </div>
          </div>
          <div className="bg-primary/5 p-4 rounded-lg flex items-center space-x-4">
            <BarChart3 className="h-10 w-10 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Labor Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>

        {/* Metrics Visualization */}
        <ManpowerMetrics manpowerRequirements={allManpowerRequirements} />

        {/* Labor By Role */}
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Labor Breakdown by Role
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Workers</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleSummaries.map((summary, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{summary.role}</TableCell>
                  <TableCell className="text-right">{summary.workers}</TableCell>
                  <TableCell className="text-right">{summary.hours.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.hourlyRate)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(summary.cost)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Labor By Component */}
        <div>
          <h3 className="text-lg font-medium mb-3">Labor Breakdown by Component</h3>
          <Accordion type="single" collapsible className="w-full">
            {componentGrouped.map((component, index) => (
              <AccordionItem key={index} value={`component-${component.id}`}>
                <AccordionTrigger className="hover:bg-muted/30 px-4 py-2 rounded-md">
                  <div className="flex justify-between w-full pr-4">
                    <span>{component.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(component.cost)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Workers</TableHead>
                        <TableHead className="text-right">Hours</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {component.manpower.map((mp, mpIndex) => (
                        <TableRow key={mpIndex}>
                          <TableCell>{mp.role}</TableCell>
                          <TableCell className="text-right">{mp.quantity}</TableCell>
                          <TableCell className="text-right">{mp.hours * mp.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(mp.hourlyRate * mp.hours * mp.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}