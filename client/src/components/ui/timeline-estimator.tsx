import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, addDays } from "date-fns";
import { Trash2, PlusCircle } from "lucide-react";
import { TimelineEstimation, TimelinePhase } from "@shared/schema";

interface TimelineEstimatorProps {
  timeline: TimelineEstimation;
  onChange: (timeline: TimelineEstimation) => void;
}

export function TimelineEstimator({ timeline, onChange }: TimelineEstimatorProps) {
  type RiskLevel = 'low' | 'medium' | 'high';
  
  const [newPhaseData, setNewPhaseData] = useState<Partial<TimelinePhase> & { riskLevel: RiskLevel }>({
    name: "",
    duration: 0,
    riskLevel: "low"
  });
  
  // Generate a unique ID for a new phase
  const generateId = () => {
    return `phase_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  // Calculate the start and end dates for phases
  const calculatePhaseDates = (phases: TimelinePhase[], startDate: Date | string): TimelinePhase[] => {
    let currentDate = new Date(startDate);
    
    return phases.map(phase => {
      const updatedPhase = { 
        ...phase,
        startDate: format(currentDate, 'yyyy-MM-dd')
      };
      
      // Add duration days to get end date
      const endDate = addDays(currentDate, phase.duration);
      updatedPhase.endDate = format(endDate, 'yyyy-MM-dd');
      
      // Next phase starts after this one
      currentDate = addDays(endDate, 1);
      
      return updatedPhase;
    });
  };
  
  // Add a new phase to the timeline
  const handleAddPhase = () => {
    if (!newPhaseData.name || !newPhaseData.duration) return;
    
    const newPhase: TimelinePhase = {
      id: generateId(),
      name: newPhaseData.name || "",
      description: newPhaseData.description || "",
      duration: newPhaseData.duration || 0,
      startDate: "", // Will be calculated
      endDate: "", // Will be calculated
      riskLevel: (newPhaseData.riskLevel as 'low' | 'medium' | 'high') || 'low',
      weatherSensitive: newPhaseData.weatherSensitive || false,
      criticalPath: newPhaseData.criticalPath || false,
      progress: 0
    };
    
    // Create new array with the added phase
    const updatedPhases = [...timeline.phases, newPhase];
    
    // Recalculate all dates based on phases
    const phasesWithDates = calculatePhaseDates(updatedPhases, timeline.startDate);
    
    // Calculate total duration (sum of all phase durations)
    const totalDuration = phasesWithDates.reduce((sum, phase) => sum + phase.duration, 0);
    
    // Calculate estimated completion date with contingencies
    const totalWithContingency = totalDuration + timeline.contingencyDays + timeline.weatherContingencyDays;
    const estimatedCompletionDate = addDays(new Date(timeline.startDate), totalWithContingency);
    
    // Update timeline
    const updatedTimeline = {
      ...timeline,
      phases: phasesWithDates,
      totalDuration: totalDuration,
      estimatedCompletionDate: format(estimatedCompletionDate, 'yyyy-MM-dd')
    };
    
    onChange(updatedTimeline);
    
    // Reset form
    setNewPhaseData({
      name: "",
      duration: 0,
      riskLevel: "low"
    });
  };
  
  // Remove a phase from the timeline
  const handleRemovePhase = (id: string) => {
    const updatedPhases = timeline.phases.filter(phase => phase.id !== id);
    
    // Recalculate all dates based on phases
    const phasesWithDates = calculatePhaseDates(updatedPhases, timeline.startDate);
    
    // Calculate total duration (sum of all phase durations)
    const totalDuration = phasesWithDates.reduce((sum, phase) => sum + phase.duration, 0);
    
    // Calculate estimated completion date with contingencies
    const totalWithContingency = totalDuration + timeline.contingencyDays + timeline.weatherContingencyDays;
    const estimatedCompletionDate = addDays(new Date(timeline.startDate), totalWithContingency);
    
    // Update timeline
    const updatedTimeline = {
      ...timeline,
      phases: phasesWithDates,
      totalDuration: totalDuration,
      estimatedCompletionDate: format(estimatedCompletionDate, 'yyyy-MM-dd')
    };
    
    onChange(updatedTimeline);
  };
  
  // Update contingency days
  const handleContingencyChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'standard' | 'weather') => {
    const value = parseInt(e.target.value) || 0;
    
    let updatedTimeline;
    if (type === 'standard') {
      updatedTimeline = {
        ...timeline,
        contingencyDays: value
      };
    } else {
      updatedTimeline = {
        ...timeline,
        weatherContingencyDays: value
      };
    }
    
    // Recalculate completion date
    const totalWithContingency = 
      timeline.totalDuration + 
      (type === 'standard' ? value : timeline.contingencyDays) + 
      (type === 'weather' ? value : timeline.weatherContingencyDays);
    
    const estimatedCompletionDate = addDays(new Date(timeline.startDate), totalWithContingency);
    
    updatedTimeline.estimatedCompletionDate = format(estimatedCompletionDate, 'yyyy-MM-dd');
    
    onChange(updatedTimeline);
  };
  
  // Change project start date
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = e.target.value;
    if (!newStartDate) return;
    
    // Recalculate all phase dates based on new start date
    const phasesWithDates = calculatePhaseDates(timeline.phases, newStartDate);
    
    // Calculate estimated completion date
    const totalWithContingency = timeline.totalDuration + timeline.contingencyDays + timeline.weatherContingencyDays;
    const estimatedCompletionDate = addDays(new Date(newStartDate), totalWithContingency);
    
    const updatedTimeline = {
      ...timeline,
      phases: phasesWithDates,
      startDate: newStartDate,
      estimatedCompletionDate: format(estimatedCompletionDate, 'yyyy-MM-dd')
    };
    
    onChange(updatedTimeline);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline Estimation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="startDate">Project Start Date</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={timeline.startDate.toString().split('T')[0]} 
                onChange={handleStartDateChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contingencyDays">Contingency Days</Label>
                <Input 
                  id="contingencyDays" 
                  type="number" 
                  min="0"
                  value={timeline.contingencyDays} 
                  onChange={(e) => handleContingencyChange(e, 'standard')}
                />
              </div>
              <div>
                <Label htmlFor="weatherDays">Weather Contingency</Label>
                <Input 
                  id="weatherDays" 
                  type="number" 
                  min="0"
                  value={timeline.weatherContingencyDays} 
                  onChange={(e) => handleContingencyChange(e, 'weather')}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
            <div className="md:col-span-4">
              <Label htmlFor="phaseName">Phase Name</Label>
              <Input 
                id="phaseName" 
                placeholder="Enter phase name" 
                value={newPhaseData.name} 
                onChange={(e) => setNewPhaseData({...newPhaseData, name: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input 
                id="duration" 
                type="number" 
                min="1"
                value={newPhaseData.duration} 
                onChange={(e) => setNewPhaseData({...newPhaseData, duration: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select 
                value={newPhaseData.riskLevel}
                onValueChange={(value: RiskLevel) => setNewPhaseData({...newPhaseData, riskLevel: value})}
              >
                <SelectTrigger id="riskLevel">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex items-end">
              <Button onClick={handleAddPhase} className="w-full">
                <PlusCircle className="h-4 w-4 mr-2" /> Add Phase
              </Button>
            </div>
          </div>
          
          {timeline.phases.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phase Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeline.phases.map((phase) => (
                  <TableRow key={phase.id}>
                    <TableCell>{phase.name}</TableCell>
                    <TableCell>{phase.startDate.toString().split('T')[0]}</TableCell>
                    <TableCell>{phase.endDate.toString().split('T')[0]}</TableCell>
                    <TableCell>{phase.duration} days</TableCell>
                    <TableCell>
                      <div className={`
                        px-2 py-1 rounded-full text-xs inline-block
                        ${phase.riskLevel === 'low' ? 'bg-green-100 text-green-800' : 
                          phase.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }
                      `}>
                        {phase.riskLevel ? phase.riskLevel.charAt(0).toUpperCase() + phase.riskLevel.slice(1) : 'Low'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemovePhase(phase.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No phases added yet. Add phases to build your project timeline.
            </div>
          )}
          
          <div className="mt-6 grid grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
            <div>
              <p className="text-sm font-medium">Total Project Duration</p>
              <p className="text-2xl font-bold">
                {timeline.totalDuration + timeline.contingencyDays + timeline.weatherContingencyDays} days
              </p>
              <p className="text-xs text-muted-foreground">
                Base: {timeline.totalDuration} days + Contingency: {timeline.contingencyDays + timeline.weatherContingencyDays} days
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Estimated Completion</p>
              <p className="text-2xl font-bold">
                {timeline.estimatedCompletionDate.toString().split('T')[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                Including all contingencies
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}