// Test script for construction items functionality
import type { ConstructionDivision, ConstructionItem } from '../shared/schema';

// Main test function
async function testConstructionItems() {
  console.log('Testing Construction Items Functionality...\n');

  try {
    // 1. Fetch all construction divisions
    console.log('1. Fetching all construction divisions:');
    const divisions = await fetchDivisions();
    console.log(`Found ${divisions.length} divisions`);
    
    // Find Division 3 (Concreto)
    const division3 = divisions.find(d => d.name === 'Concreto');
    if (!division3) {
      throw new Error('Division 3 (Concreto) not found');
    }
    console.log(`Division 3 ID: ${division3.id}, Name: ${division3.name}\n`);

    // 2. Fetch items for Division 3
    console.log('2. Fetching items for Division 3:');
    const items = await fetchItems(division3.id);
    console.log(`Found ${items.length} items for Division 3\n`);

    // 3. Group items by category
    console.log('3. Grouping items by category:');
    const itemsByCategory = groupItemsByCategory(items);
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      console.log(`Category: ${category}, Items: ${categoryItems.length}`);
    }
    console.log();

    // 4. Test edit functionality
    console.log('4. Testing edit functionality:');
    // Select an item to edit
    const itemToEdit = items[0];
    console.log('Selected item to edit:');
    printItem(itemToEdit);
    
    // Create an edited version with modified values
    const laborCost = itemToEdit.laborCost || 0;
    const materialCost = itemToEdit.materialCost || 0;
    
    const editedItem = {
      ...itemToEdit,
      description: `${itemToEdit.description} (Edited for Test)`,
      laborCost: laborCost * 1.5,
      materialCost: materialCost * 1.5,
      totalCost: (laborCost + materialCost) * 1.5
    };
    
    console.log('\nEdited version:');
    printItem(editedItem);
    
    // Send the update request
    console.log('\nSending update request...');
    const updatedItem = await updateItem(itemToEdit.id, editedItem);
    console.log('Update successful!');
    console.log('Updated item:');
    printItem(updatedItem);
    
    // Verify the update by fetching all items again and finding our updated item
    console.log('\nVerifying the update by fetching all items again...');
    const allItems = await fetchItems(division3.id);
    const verifiedItem = allItems.find(item => item.id === itemToEdit.id);
    if (!verifiedItem) {
      throw new Error('Could not find the updated item');
    }
    console.log('Verification successful!');
    console.log('Verified item:');
    printItem(verifiedItem);
    
    // Restore the original item
    console.log('\nRestoring the original item...');
    const restoredItem = await updateItem(itemToEdit.id, itemToEdit);
    console.log('Restore successful!');
    console.log('Restored item:');
    printItem(restoredItem);

    console.log('\nConstruction Items Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Helper function to fetch all divisions
async function fetchDivisions(): Promise<ConstructionDivision[]> {
  const response = await fetch('http://localhost:5000/api/construction/divisions');
  if (!response.ok) {
    throw new Error(`Failed to fetch divisions: ${response.statusText}`);
  }
  return await response.json();
}

// Helper function to fetch items for a division
async function fetchItems(divisionId: number): Promise<ConstructionItem[]> {
  const response = await fetch(`http://localhost:5000/api/construction/divisions/${divisionId}/items`);
  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }
  return await response.json();
}

// Helper function to fetch a specific item by ID
async function fetchItemById(itemId: number, divisionId: number): Promise<ConstructionItem | undefined> {
  // Since there's no direct endpoint for fetching a single item,
  // we'll fetch all items for the division and find the one we need
  const items = await fetchItems(divisionId);
  return items.find(item => item.id === itemId);
}

// Helper function to update an item
async function updateItem(itemId: number, item: Partial<ConstructionItem>): Promise<ConstructionItem> {
  const response = await fetch(`http://localhost:5000/api/construction/items/${itemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update item: ${response.statusText}`);
  }
  
  return await response.json();
}

// Helper function to group items by category
function groupItemsByCategory(items: ConstructionItem[]): Record<string, ConstructionItem[]> {
  const result: Record<string, ConstructionItem[]> = {};
  
  for (const item of items) {
    const category = item.notes || 'Uncategorized';
    if (!result[category]) {
      result[category] = [];
    }
    result[category].push(item);
  }
  
  return result;
}

// Helper function to print item details
function printItem(item: ConstructionItem) {
  console.log(`ID: ${item.id}`);
  console.log(`Description: ${item.description}`);
  console.log(`Labor Cost: $${item.laborCost?.toFixed(2)}`);
  console.log(`Material Cost: $${item.materialCost?.toFixed(2)}`);
  console.log(`Total Cost: $${item.totalCost?.toFixed(2)}`);
  if (item.notes) {
    console.log(`Category: ${item.notes}`);
  }
}

// Run the test
testConstructionItems().catch(console.error);
