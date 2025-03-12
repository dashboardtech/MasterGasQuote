import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type { z } from "zod";

// Base user table from template
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Helper function to get current date in ISO format
const getCurrentDate = () => new Date().toISOString();

// Quotes table
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  client: text("client"),
  location: text("location"),
  completionDate: text("completion_date"),
  createdAt: text("created_at").notNull().$defaultFn(() => getCurrentDate()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => getCurrentDate()),
  notes: text("notes"),
  status: text("status").default("draft"),
  timeline: blob("timeline", { mode: 'json' }), // Timeline estimation stored as JSON
  siteSpecificFactors: blob("site_specific_factors", { mode: 'json' }), // Site-specific considerations
  vendors: blob("vendors", { mode: 'json' }), // Associated vendors/contractors
  operationalCosts: blob("operational_costs", { mode: 'json' }), // Projected operational costs
});

// Components table
export const components = sqliteTable("components", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteId: integer("quote_id").notNull(),
  parentId: integer("parent_id"), // Optional parent component ID for component relationships
  type: text("type").notNull(), // 'tank', 'dispenser', 'soil', 'concrete', 'administrative', etc.
  name: text("name").notNull(),
  description: text("description"),
  configuration: blob("configuration", { mode: 'json' }).notNull(), // Stores configuration details as JSON
  quantity: integer("quantity").default(1),
  unitCost: real("unit_cost").notNull(), // SQLite uses real for decimal values
  totalCost: real("total_cost").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => getCurrentDate()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => getCurrentDate()),
});

// Schema validation for user
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema validation for quote
export const insertQuoteSchema = createInsertSchema(quotes).pick({
  name: true,
  client: true,
  location: true,
  completionDate: true,
  notes: true,
  status: true,
  timeline: true,
  siteSpecificFactors: true,
  vendors: true,
  operationalCosts: true,
});

// Schema validation for component
export const insertComponentSchema = createInsertSchema(components).pick({
  quoteId: true,
  parentId: true,
  type: true,
  name: true,
  description: true,
  configuration: true,
  quantity: true,
  unitCost: true,
  totalCost: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type InsertComponent = z.infer<typeof insertComponentSchema>;
export type Component = typeof components.$inferSelect;

// Custom configuration types for type safety
export type TankConfiguration = {
  capacity: string;
  material: string;
};

export type DispenserConfiguration = {
  model: string;
  hoses: number;
};

export type SoilExtractionConfiguration = {
  volume: number;
  unitMeasurement: string;
};

export type ConcreteConfiguration = {
  area: number;
  unitMeasurement: string;
  thickness?: number;
};

export type AdministrativeBuildingConfiguration = {
  size: number;
  unitMeasurement: string;
  type: string;
};

export type PipingSystemConfiguration = {
  length: number;
  diameter: number;
  material: string;
  unitMeasurement: string;
};

export type ElectricalPanelConfiguration = {
  capacity: number;
  phases: number;
  voltage: number;
};

export type CanopyConfiguration = {
  area: number;
  unitMeasurement: string;
  lightingType: string;
};

// ManpowerRequirement type
export type ManpowerRequirement = {
  role: string;      // The type of worker (e.g., "electrician", "pipefitter", "laborer", etc.)
  hourlyRate: number; // Hourly rate for this role
  hours: number;     // Estimated hours needed
  quantity: number;  // Number of workers needed in this role
};

// Material specification types
export type MaterialSpecification = {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  unitOfMeasure: string;
  quantity: number;
  supplier?: string;
  leadTime?: number; // in days
  alternativeOptions?: MaterialAlternative[];
};

export type MaterialAlternative = {
  id: string;
  name: string;
  description?: string;
  unitCost: number;
  advantages?: string[];
  disadvantages?: string[];
  isEcoFriendly?: boolean;
};

// Timeline estimation types
export type TimelinePhase = {
  id: string;
  name: string;
  description?: string;
  startDate: Date | string;
  endDate: Date | string;
  duration: number; // in days
  predecessors?: string[]; // IDs of phases that must complete before this one
  resources?: string[]; // IDs of resources required
  progress?: number; // 0-100%
  criticalPath?: boolean; // Whether this phase is on the critical path
  riskLevel?: 'low' | 'medium' | 'high';
  weatherSensitive?: boolean;
};

export type TimelineEstimation = {
  phases: TimelinePhase[];
  totalDuration: number; // in days
  contingencyDays: number;
  weatherContingencyDays: number;
  startDate: Date | string;
  estimatedCompletionDate: Date | string;
};

// Vendor/contractor types
export type Vendor = {
  id: string;
  name: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  specialties: string[];
  rates?: Record<string, number>;
  ratings?: number; // 1-5
  certifications?: string[];
  insuranceExpiryDate?: Date | string;
};

// Site-specific factors
export type SiteSpecificFactors = {
  soilCondition?: {
    type: string;
    contaminationLevel?: 'none' | 'low' | 'medium' | 'high';
    permeability?: string;
    stability?: string;
    extraCosts?: number;
  };
  groundwater?: {
    level: number; // in feet
    quality?: string;
    requiresDewatering?: boolean;
    dewateringCost?: number;
  };
  utilities?: {
    electricalConnection: {
      distance: number;
      costPerFoot: number;
      totalCost: number;
    };
    waterConnection?: {
      distance: number;
      costPerFoot: number;
      totalCost: number;
    };
    sewerConnection?: {
      distance: number;
      costPerFoot: number;
      totalCost: number;
    };
  };
  trafficFlow?: {
    currentDailyTraffic?: number;
    peakHourVolume?: number;
    requiredLanes?: number;
    entryPointCount?: number;
    exitPointCount?: number;
  };
  zoningRequirements?: string[];
  environmentalConcerns?: string[];
};

// Operational cost projections
export type OperationalCostProjection = {
  maintenance: {
    annual: number;
    fiveYear: number;
    tenYear: number;
    description?: string;
    breakdownBySystem?: Record<string, number>;
  };
  utilities: {
    electricity: {
      monthlyKwh: number;
      monthlyCost: number;
      annualCost: number;
    };
    water?: {
      monthlyGallons: number;
      monthlyCost: number;
      annualCost: number;
    };
    sewage?: {
      monthlyCost: number;
      annualCost: number;
    };
    internet?: {
      monthlyCost: number;
      annualCost: number;
    };
  };
  staffing?: {
    positions: {
      title: string;
      count: number;
      annualSalary: number;
      benefits: number;
    }[];
    totalAnnualCost: number;
  };
  insurance?: {
    liability: number;
    property: number;
    workers: number;
    totalAnnual: number;
  };
  totalAnnualOperatingCost: number;
  estimatedAnnualRevenue?: number;
  estimatedBreakeven?: number; // in months
};

// Construction Divisions table - for storing main construction categories
export const constructionDivisions = sqliteTable("construction_divisions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  divisionNumber: text("division_number").notNull(), // e.g., "1", "3", "4"
  name: text("name").notNull(), // e.g., "Requisitos Generales", "Concreto"
  description: text("description"),
  createdAt: text("created_at").notNull().$defaultFn(() => getCurrentDate()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => getCurrentDate()),
});

// Construction Items table - for storing individual line items within divisions
export const constructionItems = sqliteTable("construction_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  divisionId: integer("division_id").notNull(), // Foreign key to constructionDivisions
  code: text("code"), // e.g., "01 41 26", "0151 13"
  description: text("description").notNull(),
  quantity: real("quantity").default(1),
  unit: text("unit"), // e.g., "ea", "m2", "m3"
  laborCost: real("labor_cost").default(0), // Cost per unit for labor
  materialCost: real("material_cost").default(0), // Cost per unit for materials
  totalCost: real("total_cost").default(0), // Total cost (calculated)
  notes: text("notes"),
  createdAt: text("created_at").notNull().$defaultFn(() => getCurrentDate()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => getCurrentDate()),
});

// Schema validation for construction division
export const insertConstructionDivisionSchema = createInsertSchema(constructionDivisions).pick({
  divisionNumber: true,
  name: true,
  description: true,
});

// Schema validation for construction item
export const insertConstructionItemSchema = createInsertSchema(constructionItems).pick({
  divisionId: true,
  code: true,
  description: true,
  quantity: true,
  unit: true,
  laborCost: true,
  materialCost: true,
  totalCost: true,
  notes: true,
});

// Type definitions for construction divisions and items
export type InsertConstructionDivision = z.infer<typeof insertConstructionDivisionSchema>;
export type ConstructionDivision = typeof constructionDivisions.$inferSelect;

export type InsertConstructionItem = z.infer<typeof insertConstructionItemSchema>;
export type ConstructionItem = typeof constructionItems.$inferSelect;

// Combined configuration type with optional manpower and materials fields for all component types
export type ComponentConfiguration = 
  | (TankConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>
    })
  | (DispenserConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>
    })
  | (SoilExtractionConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>
    })
  | (ConcreteConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>,
      psiRating?: number
    })
  | (AdministrativeBuildingConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>
    })
  | (PipingSystemConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>,
      pressureRating?: number,
      temperatureRating?: number
    })
  | (ElectricalPanelConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>,
      certifications?: string[]
    })
  | (CanopyConfiguration & { 
      manpower?: ManpowerRequirement[], 
      materials?: MaterialSpecification[],
      specifications?: Record<string, string>,
      windRating?: number
    });
