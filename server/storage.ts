import { 
  users, 
  quotes,
  components,
  type User, 
  type InsertUser, 
  type Quote, 
  type InsertQuote,
  type Component,
  type InsertComponent
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

// Storage interface with CRUD operations for users, quotes, and components
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Quote operations
  getQuotes(): Promise<Quote[]>;
  getQuoteById(id: number): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Component operations
  getComponentsByQuoteId(quoteId: number): Promise<Component[]>;
  getComponentById(id: number): Promise<Component | undefined>;
  getSubcomponentsByParentId(parentId: number): Promise<Component[]>;
  createComponent(component: InsertComponent): Promise<Component>;
  updateComponent(id: number, component: Partial<InsertComponent>): Promise<Component | undefined>;
  deleteComponent(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }

  async getQuoteById(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    // Format date as ISO string for SQLite compatibility
    const now = new Date().toISOString();
    
    // Prepare the quote data with proper handling of JSON fields
    const quoteData = {
      ...insertQuote,
      // Ensure JSON fields are properly handled for SQLite
      timeline: insertQuote.timeline ?? null,
      siteSpecificFactors: insertQuote.siteSpecificFactors ?? null,
      vendors: insertQuote.vendors ?? null,
      operationalCosts: insertQuote.operationalCosts ?? null,
      createdAt: now,
      updatedAt: now
    };
    
    // Log the prepared data for debugging
    console.log('Prepared quote data for SQLite:', JSON.stringify(quoteData, null, 2));
    
    const [quote] = await db.insert(quotes).values(quoteData).returning();
    return quote;
  }

  async updateQuote(id: number, quoteUpdate: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db.update(quotes)
      .set({
        ...quoteUpdate,
        updatedAt: new Date().toISOString()
      })
      .where(eq(quotes.id, id))
      .returning();
    
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    // Delete all components associated with this quote first
    await db.delete(components).where(eq(components.quoteId, id));
    
    // Delete the quote
    const [deletedQuote] = await db.delete(quotes).where(eq(quotes.id, id)).returning();
    return !!deletedQuote;
  }

  // Component methods
  async getComponentsByQuoteId(quoteId: number): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.quoteId, quoteId));
  }

  async getComponentById(id: number): Promise<Component | undefined> {
    const [component] = await db.select().from(components).where(eq(components.id, id));
    return component;
  }
  
  async getSubcomponentsByParentId(parentId: number): Promise<Component[]> {
    return await db.select().from(components).where(eq(components.parentId, parentId));
  }

  async createComponent(insertComponent: InsertComponent): Promise<Component> {
    const now = new Date().toISOString();
    
    // Handle null parentId properly
    const componentData = {
      ...insertComponent,
      createdAt: now,
      updatedAt: now,
      quantity: insertComponent.quantity || 1
    };
    
    const [component] = await db.insert(components).values(componentData).returning();
    return component;
  }

  async updateComponent(id: number, componentUpdate: Partial<InsertComponent>): Promise<Component | undefined> {
    const [updatedComponent] = await db.update(components)
      .set({
        ...componentUpdate,
        updatedAt: new Date().toISOString()
      })
      .where(eq(components.id, id))
      .returning();
    
    return updatedComponent;
  }

  async deleteComponent(id: number): Promise<boolean> {
    // First find all subcomponents recursively and delete them
    const findAndDeleteSubcomponents = async (parentId: number) => {
      const subcomponents = await this.getSubcomponentsByParentId(parentId);
      for (const subcomponent of subcomponents) {
        await findAndDeleteSubcomponents(subcomponent.id);
        await db.delete(components).where(eq(components.id, subcomponent.id));
      }
    };
    
    await findAndDeleteSubcomponents(id);
    
    // Then delete the component itself
    const [deletedComponent] = await db.delete(components).where(eq(components.id, id)).returning();
    return !!deletedComponent;
  }
}

// Initialize with DB storage
export const storage = new DatabaseStorage();
