import { ManpowerRole } from "./types";

// Predefined manpower roles for gas station construction projects
export const manpowerRoles: ManpowerRole[] = [
  {
    id: "supervisor",
    name: "Site Supervisor",
    description: "Oversees all construction activities and coordinates work crews",
    defaultRate: 65.00
  },
  {
    id: "engineer",
    name: "Civil Engineer",
    description: "Handles technical specifications and ensures structural integrity",
    defaultRate: 85.00
  },
  {
    id: "electrician",
    name: "Electrician",
    description: "Installs and maintains electrical systems",
    defaultRate: 55.00
  },
  {
    id: "pipefitter",
    name: "Pipefitter",
    description: "Installs and repairs fuel distribution piping",
    defaultRate: 50.00
  },
  {
    id: "concrete_worker",
    name: "Concrete Worker",
    description: "Handles concrete pouring and finishing",
    defaultRate: 45.00
  },
  {
    id: "excavator_operator",
    name: "Excavator Operator",
    description: "Operates heavy machinery for excavation",
    defaultRate: 60.00
  },
  {
    id: "general_laborer",
    name: "General Laborer",
    description: "Performs various manual labor tasks",
    defaultRate: 35.00
  },
  {
    id: "fuel_system_technician",
    name: "Fuel System Technician",
    description: "Specialized in fuel system installation and calibration",
    defaultRate: 65.00
  },
  {
    id: "environmental_specialist",
    name: "Environmental Specialist",
    description: "Ensures compliance with environmental regulations",
    defaultRate: 75.00
  },
  {
    id: "safety_officer",
    name: "Safety Officer",
    description: "Monitors site safety and ensures OSHA compliance",
    defaultRate: 60.00
  }
];

// Default manpower requirements by component type
export const defaultManpowerRequirements: Record<string, Array<{ roleId: string; hours: number; quantity: number }>> = {
  tank: [
    { roleId: "excavator_operator", hours: 16, quantity: 1 },
    { roleId: "pipefitter", hours: 24, quantity: 2 },
    { roleId: "fuel_system_technician", hours: 24, quantity: 2 },
    { roleId: "general_laborer", hours: 32, quantity: 4 }
  ],
  dispenser: [
    { roleId: "electrician", hours: 16, quantity: 2 },
    { roleId: "fuel_system_technician", hours: 16, quantity: 1 },
    { roleId: "general_laborer", hours: 8, quantity: 2 }
  ],
  soil: [
    { roleId: "excavator_operator", hours: 24, quantity: 1 },
    { roleId: "environmental_specialist", hours: 8, quantity: 1 },
    { roleId: "general_laborer", hours: 24, quantity: 3 }
  ],
  concrete: [
    { roleId: "concrete_worker", hours: 24, quantity: 3 },
    { roleId: "general_laborer", hours: 16, quantity: 4 }
  ],
  administrative: [
    { roleId: "supervisor", hours: 40, quantity: 1 },
    { roleId: "electrician", hours: 32, quantity: 2 },
    { roleId: "general_laborer", hours: 80, quantity: 4 }
  ],
  electrical: [
    { roleId: "electrician", hours: 40, quantity: 2 },
    { roleId: "general_laborer", hours: 16, quantity: 2 }
  ],
  canopy: [
    { roleId: "supervisor", hours: 16, quantity: 1 },
    { roleId: "electrician", hours: 24, quantity: 2 },
    { roleId: "general_laborer", hours: 40, quantity: 4 }
  ],
  piping: [
    { roleId: "pipefitter", hours: 32, quantity: 2 },
    { roleId: "general_laborer", hours: 24, quantity: 2 }
  ],
  excavation: [
    { roleId: "excavator_operator", hours: 24, quantity: 1 },
    { roleId: "general_laborer", hours: 32, quantity: 3 }
  ],
  sensors: [
    { roleId: "electrician", hours: 16, quantity: 1 },
    { roleId: "fuel_system_technician", hours: 8, quantity: 1 }
  ],
  wiring: [
    { roleId: "electrician", hours: 24, quantity: 2 },
    { roleId: "general_laborer", hours: 8, quantity: 1 }
  ]
};

// Helper function to get manpower requirements for a component type
export function getDefaultManpowerForComponentType(componentType: string) {
  const requirements = defaultManpowerRequirements[componentType] || [];
  return requirements.map(req => {
    const role = manpowerRoles.find(r => r.id === req.roleId);
    if (!role) return null;
    
    return {
      role: role.name,
      hourlyRate: role.defaultRate,
      hours: req.hours,
      quantity: req.quantity
    };
  }).filter(item => item !== null);
}

// Calculate total manpower cost
export function calculateManpowerCost(manpowerRequirements: any[]) {
  return manpowerRequirements.reduce((total, req) => {
    return total + (req.hourlyRate * req.hours * req.quantity);
  }, 0);
}

// Calculate manpower cost summary
export function generateManpowerSummary(components: any[]) {
  const summary = {
    totalHours: 0,
    totalCost: 0,
    laborCostByRole: {} as Record<string, { hours: number; cost: number }>
  };

  components.forEach(component => {
    const manpowerReqs = component.configuration?.manpower || [];
    
    manpowerReqs.forEach((req: any) => {
      const roleKey = req.role;
      const totalHours = req.hours * req.quantity;
      const roleCost = req.hourlyRate * totalHours;
      
      summary.totalHours += totalHours;
      summary.totalCost += roleCost;
      
      if (!summary.laborCostByRole[roleKey]) {
        summary.laborCostByRole[roleKey] = { hours: 0, cost: 0 };
      }
      
      summary.laborCostByRole[roleKey].hours += totalHours;
      summary.laborCostByRole[roleKey].cost += roleCost;
    });
  });
  
  return summary;
}