import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Users } from 'lucide-react';
import { ManpowerRequirement } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { manpowerRoles, calculateManpowerCost } from '@/lib/manpowerData';

interface ManpowerSelectorProps {
  manpowerRequirements: ManpowerRequirement[];
  onChange: (requirements: ManpowerRequirement[]) => void;
  componentType?: string;
}

export function ManpowerSelector({ 
  manpowerRequirements, 
  onChange,
  componentType
}: ManpowerSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [isAdding, setIsAdding] = useState(false);

  // Reset form when toggling add mode
  useEffect(() => {
    if (!isAdding) {
      setSelectedRole('');
      setHourlyRate('');
      setHours('');
      setQuantity('1');
    }
  }, [isAdding]);

  // Set default hourly rate when role is selected
  useEffect(() => {
    if (selectedRole) {
      const role = manpowerRoles.find(r => r.id === selectedRole);
      if (role) {
        setHourlyRate(role.defaultRate.toString());
      }
    }
  }, [selectedRole]);

  const handleAddRequirement = () => {
    if (!selectedRole || !hourlyRate || !hours || !quantity) return;

    const role = manpowerRoles.find(r => r.id === selectedRole);
    if (!role) return;

    const newRequirement: ManpowerRequirement = {
      role: role.name,
      hourlyRate: parseFloat(hourlyRate),
      hours: parseFloat(hours),
      quantity: parseInt(quantity, 10)
    };

    const updatedRequirements = [...manpowerRequirements, newRequirement];
    onChange(updatedRequirements);
    
    // Reset form
    setIsAdding(false);
  };

  const handleRemoveRequirement = (index: number) => {
    const updatedRequirements = manpowerRequirements.filter((_, i) => i !== index);
    onChange(updatedRequirements);
  };

  const totalManpowerCost = calculateManpowerCost(manpowerRequirements);
  const totalManpowerHours = manpowerRequirements.reduce(
    (total, req) => total + (req.hours * req.quantity), 
    0
  );

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Manpower Requirements
          </CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-primary/10">
              Total: {formatCurrency(totalManpowerCost)}
            </Badge>
            <Badge variant="outline" className="bg-primary/10">
              Hours: {totalManpowerHours}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {manpowerRequirements.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Workers</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manpowerRequirements.map((requirement, index) => (
                <TableRow key={index}>
                  <TableCell>{requirement.role}</TableCell>
                  <TableCell className="text-right">{formatCurrency(requirement.hourlyRate)}</TableCell>
                  <TableCell className="text-right">{requirement.hours}</TableCell>
                  <TableCell className="text-right">{requirement.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(requirement.hourlyRate * requirement.hours * requirement.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No manpower requirements defined yet
          </div>
        )}

        {isAdding ? (
          <div className="mt-4 border p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="roleSelect">Worker Role</Label>
                <Select 
                  value={selectedRole} 
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger id="roleSelect">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {manpowerRoles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hours">Hours Needed</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="quantity">Number of Workers</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddRequirement}
                disabled={!selectedRole || !hourlyRate || !hours || !quantity}
                className="bg-primary hover:bg-primary/90"
              >
                Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2"
              variant="outline"
            >
              <PlusCircle className="h-4 w-4" />
              Add Manpower Requirement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ManpowerSelector;