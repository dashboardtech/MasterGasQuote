import React from 'react';
import { ManpowerRequirement } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, Clock, Users } from 'lucide-react';

interface ManpowerMetricsProps {
  manpowerRequirements: ManpowerRequirement[];
}

export function ManpowerMetrics({ manpowerRequirements }: ManpowerMetricsProps) {
  if (manpowerRequirements.length === 0) {
    return null;
  }

  // Calculate total cost and hours
  const totalCost = manpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + (req.hourlyRate * req.hours * req.quantity), 
    0
  );
  
  const totalHours = manpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + (req.hours * req.quantity), 
    0
  );
  
  const totalWorkers = manpowerRequirements.reduce(
    (sum: number, req: ManpowerRequirement) => sum + req.quantity, 
    0
  );

  // Group by role to calculate role-based metrics
  const roleMetrics = manpowerRequirements.reduce((acc: Array<{role: string; cost: number; hours: number; workers: number}>, req: ManpowerRequirement) => {
    const existingRole = acc.find(r => r.role === req.role);
    if (existingRole) {
      existingRole.cost += req.hourlyRate * req.hours * req.quantity;
      existingRole.hours += req.hours * req.quantity;
      existingRole.workers += req.quantity;
    } else {
      acc.push({
        role: req.role,
        cost: req.hourlyRate * req.hours * req.quantity,
        hours: req.hours * req.quantity,
        workers: req.quantity
      });
    }
    return acc;
  }, [] as Array<{role: string; cost: number; hours: number; workers: number}>);
  
  // Sort roles by cost (highest first)
  roleMetrics.sort((a, b) => b.cost - a.cost);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="mr-2 h-5 w-5" />
          Manpower Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-md">
            <Users className="h-8 w-8 text-primary mb-2" />
            <span className="text-lg font-bold">{totalWorkers}</span>
            <span className="text-sm text-muted-foreground">Total Workers</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-md">
            <Clock className="h-8 w-8 text-primary mb-2" />
            <span className="text-lg font-bold">{totalHours}</span>
            <span className="text-sm text-muted-foreground">Labor Hours</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-primary/5 rounded-md">
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <span className="text-lg font-bold">{formatCurrency(totalCost)}</span>
            <span className="text-sm text-muted-foreground">Labor Cost</span>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Cost Distribution by Role</h4>
          {roleMetrics.map((metric, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{metric.role}</span>
                <span>{formatCurrency(metric.cost)} ({Math.round(metric.cost / totalCost * 100)}%)</span>
              </div>
              <Progress value={metric.cost / totalCost * 100} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default ManpowerMetrics;