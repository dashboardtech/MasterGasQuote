import { Router } from 'express';
import { db } from '../db';
import { constructionDivisions, constructionItems } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// Get all construction divisions
router.get('/divisions', async (req, res) => {
  try {
    const divisions = await db.select().from(constructionDivisions).orderBy(constructionDivisions.divisionNumber);
    res.json(divisions);
  } catch (error) {
    console.error('Error fetching construction divisions:', error);
    res.status(500).json({ message: 'Error fetching construction divisions' });
  }
});

// Get items for a specific division
router.get('/divisions/:id/items', async (req, res) => {
  const divisionId = Number.parseInt(req.params.id, 10);
  
  if (Number.isNaN(divisionId)) {
    return res.status(400).json({ message: 'Invalid division ID' });
  }
  
  try {
    const items = await db.select()
      .from(constructionItems)
      .where(eq(constructionItems.divisionId, divisionId))
      .orderBy(constructionItems.code);
    
    res.json(items);
  } catch (error) {
    console.error(`Error fetching items for division ${divisionId}:`, error);
    res.status(500).json({ message: 'Error fetching construction items' });
  }
});

// Create a new construction item
router.post('/divisions/:id/items', async (req, res) => {
  const divisionId = Number.parseInt(req.params.id, 10);
  
  if (Number.isNaN(divisionId)) {
    return res.status(400).json({ message: 'Invalid division ID' });
  }
  
  try {
    const newItem = {
      divisionId,
      ...req.body,
      totalCost: parseFloat(req.body.laborCost || 0) + parseFloat(req.body.materialCost || 0)
    };
    
    const result = await db.insert(constructionItems).values(newItem).returning();
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating construction item:', error);
    res.status(500).json({ message: 'Error creating construction item' });
  }
});

// Update an existing construction item
router.put('/items/:id', async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }
  
  try {
    // Calculate total cost
    const totalCost = Number.parseFloat(req.body.laborCost || 0) + Number.parseFloat(req.body.materialCost || 0);
    
    const result = await db.update(constructionItems)
      .set({
        ...req.body,
        totalCost
      })
      .where(eq(constructionItems.id, itemId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Construction item not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error(`Error updating construction item ${itemId}:`, error);
    res.status(500).json({ message: 'Error updating construction item' });
  }
});

// Delete a construction item
router.delete('/items/:id', async (req, res) => {
  const itemId = Number.parseInt(req.params.id, 10);
  
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid item ID' });
  }
  
  try {
    const result = await db.delete(constructionItems)
      .where(eq(constructionItems.id, itemId))
      .returning();
    
    if (result.length === 0) {
      return res.status(404).json({ message: 'Construction item not found' });
    }
    
    res.json({ message: 'Construction item deleted successfully' });
  } catch (error) {
    console.error(`Error deleting construction item ${itemId}:`, error);
    res.status(500).json({ message: 'Error deleting construction item' });
  }
});

export default router;
