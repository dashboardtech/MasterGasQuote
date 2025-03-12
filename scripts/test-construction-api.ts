// Using built-in fetch API
import type { ConstructionDivision, ConstructionItem } from '../shared/schema';

// Test the construction divisions and items API endpoints
async function testConstructionAPI() {
  try {
    console.log('Testing Construction API...');
    
    // 1. Get all divisions
    console.log('\n1. Fetching all construction divisions:');
    const divisionsResponse = await fetch('http://localhost:5000/api/construction/divisions');
    
    if (!divisionsResponse.ok) {
      throw new Error(`Failed to fetch divisions: ${divisionsResponse.statusText}`);
    }
    
    const divisions = await divisionsResponse.json();
    console.log(`Found ${divisions.length} divisions`);
    
    // Find Division 3 for testing
    const division3 = divisions.find((div: ConstructionDivision) => div.divisionNumber === '3');
    
    if (!division3) {
      throw new Error('Division 3 not found');
    }
    
    console.log(`Division 3 ID: ${division3.id}, Name: ${division3.name}`);
    
    // 2. Get items for Division 3
    console.log('\n2. Fetching items for Division 3:');
    const itemsResponse = await fetch(`http://localhost:5000/api/construction/divisions/${division3.id}/items`);
    
    if (!itemsResponse.ok) {
      throw new Error(`Failed to fetch items: ${itemsResponse.statusText}`);
    }
    
    const items = await itemsResponse.json();
    console.log(`Found ${items.length} items for Division 3`);
    
    // 3. Group items by category (notes field)
    console.log('\n3. Grouping items by category:');
    const groupedItems = items.reduce((groups: Record<string, ConstructionItem[]>, item: ConstructionItem) => {
      const category = item.notes || 'Uncategorized';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
    
    // Display categories and item counts
    for (const [category, categoryItems] of Object.entries(groupedItems) as [string, ConstructionItem[]][]) {
      console.log(`Category: ${category}, Items: ${categoryItems.length}`);
    }
    
    // 4. Calculate totals
    console.log('\n4. Calculating totals:');
    const totalLaborCost = items.reduce((sum: number, item: ConstructionItem) => sum + (item.laborCost || 0), 0);
    const totalMaterialCost = items.reduce((sum: number, item: ConstructionItem) => sum + (item.materialCost || 0), 0);
    const totalCost = items.reduce((sum: number, item: ConstructionItem) => sum + (item.totalCost || 0), 0);
    
    console.log(`Total Labor Cost: $${totalLaborCost.toFixed(2)}`);
    console.log(`Total Material Cost: $${totalMaterialCost.toFixed(2)}`);
    console.log(`Total Cost: $${totalCost.toFixed(2)}`);
    
    console.log('\nAPI Test completed successfully!');
  } catch (error) {
    console.error('Error testing Construction API:', error);
  }
}

// Run the test
testConstructionAPI();
