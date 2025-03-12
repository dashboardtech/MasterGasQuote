import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQuoteSchema, 
  insertComponentSchema,
  type Quote,
  type Component
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import constructionRoutes from "./routes/construction";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Quotes endpoints
  apiRouter.get("/quotes", async (req: Request, res: Response) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  apiRouter.get("/quotes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }
      
      const quote = await storage.getQuoteById(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(quote);
    } catch (error) {
      console.error("Error fetching quote:", error);
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  apiRouter.post("/quotes", async (req: Request, res: Response) => {
    try {
      console.log("Quote creation request body:", JSON.stringify(req.body, null, 2));
      
      try {
        const quoteData = insertQuoteSchema.parse(req.body);
        console.log("Parsed quote data:", JSON.stringify(quoteData, null, 2));
        
        try {
          const newQuote = await storage.createQuote(quoteData);
          res.status(201).json(newQuote);
        } catch (dbError) {
          console.error("Database error creating quote:", dbError);
          // Log the full error stack trace for debugging
          console.error(dbError.stack);
          res.status(500).json({ message: "Database error creating quote", error: dbError.message });
        }
      } catch (validationError) {
        if (validationError instanceof ZodError) {
          const readableError = fromZodError(validationError);
          console.error("Validation error:", readableError.message);
          res.status(400).json({ message: "Validation error", errors: readableError.details });
        } else {
          console.error("Unknown validation error:", validationError);
          res.status(400).json({ message: "Invalid quote data" });
        }
      }
    } catch (error) {
      console.error("Unexpected error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote", error: String(error) });
    }
  });

  apiRouter.put("/quotes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }
      
      // We use partial validation for updates
      const quoteData = insertQuoteSchema.partial().parse(req.body);
      const updatedQuote = await storage.updateQuote(id, quoteData);
      
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.json(updatedQuote);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  apiRouter.delete("/quotes/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }
      
      const deleted = await storage.deleteQuote(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ message: "Failed to delete quote" });
    }
  });

  // Components endpoints
  apiRouter.get("/quotes/:quoteId/components", async (req: Request, res: Response) => {
    try {
      const quoteId = parseInt(req.params.quoteId);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "Invalid quote ID" });
      }
      
      const components = await storage.getComponentsByQuoteId(quoteId);
      res.json(components);
    } catch (error) {
      console.error("Error fetching components:", error);
      res.status(500).json({ message: "Failed to fetch components" });
    }
  });
  
  // Get subcomponents by parent component ID
  apiRouter.get("/components/:parentId/subcomponents", async (req: Request, res: Response) => {
    try {
      const parentId = parseInt(req.params.parentId);
      if (isNaN(parentId)) {
        return res.status(400).json({ message: "Invalid parent component ID" });
      }
      
      const subcomponents = await storage.getSubcomponentsByParentId(parentId);
      res.json(subcomponents);
    } catch (error) {
      console.error("Error fetching subcomponents:", error);
      res.status(500).json({ message: "Failed to fetch subcomponents" });
    }
  });

  apiRouter.get("/components/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const component = await storage.getComponentById(id);
      if (!component) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.json(component);
    } catch (error) {
      console.error("Error fetching component:", error);
      res.status(500).json({ message: "Failed to fetch component" });
    }
  });

  apiRouter.post("/components", async (req: Request, res: Response) => {
    try {
      const componentData = insertComponentSchema.parse(req.body);
      const newComponent = await storage.createComponent(componentData);
      res.status(201).json(newComponent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating component:", error);
      res.status(500).json({ message: "Failed to create component" });
    }
  });

  apiRouter.put("/components/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      // We use partial validation for updates
      const componentData = insertComponentSchema.partial().parse(req.body);
      const updatedComponent = await storage.updateComponent(id, componentData);
      
      if (!updatedComponent) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.json(updatedComponent);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error updating component:", error);
      res.status(500).json({ message: "Failed to update component" });
    }
  });

  apiRouter.delete("/components/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid component ID" });
      }
      
      const deleted = await storage.deleteComponent(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Component not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting component:", error);
      res.status(500).json({ message: "Failed to delete component" });
    }
  });

  // Register construction routes
  apiRouter.use("/construction", constructionRoutes);

  // Use the API router with the /api prefix
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
