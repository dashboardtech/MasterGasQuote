// Test script for editing construction items
import type { ConstructionDivision, ConstructionItem } from '../shared/schema';

// Test the edit functionality
async function testEditItem() {
  try {
    console.log('Testing Edit Item Functionality...');
    
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
    
    const items = await itemsResponse.json() as ConstructionItem[];
    console.log(`Found ${items.length} items for Division 3`);
    
    if (items.length === 0) {
      throw new Error('No items found to test edit functionality');
    }
    
    // 3. Select the first item to edit
    const itemToEdit = items[0];
    console.log('\n3. Selected item to edit:');
    console.log(`ID: ${itemToEdit.id}`);
    console.log(`Description: ${itemToEdit.description}`);
    console.log(`Labor Cost: $${itemToEdit.laborCost?.toFixed(2) || '0.00'}`);
    console.log(`Material Cost: $${itemToEdit.materialCost?.toFixed(2) || '0.00'}`);
    console.log(`Total Cost: $${itemToEdit.totalCost?.toFixed(2) || '0.00'}`);
    
    // 4. Edit the item
    console.log('\n4. Editing the item:');
    const updatedDescription = `${itemToEdit.description} (Edited)`;
    const updatedLaborCost = (itemToEdit.laborCost || 0) + 100;
    const updatedMaterialCost = (itemToEdit.materialCost || 0) + 200;
    
    const updatedItem = {
      ...itemToEdit,
      description: updatedDescription,
      laborCost: updatedLaborCost,
      materialCost: updatedMaterialCost,
      totalCost: updatedLaborCost + updatedMaterialCost
    };
    
    console.log(`New Description: ${updatedItem.description}`);
    console.log(`New Labor Cost: $${updatedItem.laborCost.toFixed(2)}`);
    console.log(`New Material Cost: $${updatedItem.materialCost.toFixed(2)}`);
    console.log(`New Total Cost: $${updatedItem.totalCost.toFixed(2)}`);
    
    // 5. Send the update request
    console.log('\n5. Sending update request:');
    const updateResponse = await fetch(`http://localhost:5000/api/construction/items/${itemToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedItem),
    });
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => null);
      throw new Error(errorData?.message || `Error updating item: ${updateResponse.statusText}`);
    }
    
    const result = await updateResponse.json();
    console.log('Update successful!');
    console.log(`Updated Item ID: ${result.id}`);
    console.log(`Updated Description: ${result.description}`);
    console.log(`Updated Labor Cost: $${result.laborCost.toFixed(2)}`);
    console.log(`Updated Material Cost: $${result.materialCost.toFixed(2)}`);
    console.log(`Updated Total Cost: $${result.totalCost.toFixed(2)}`);
    
    // 6. Verify the update
    console.log('\n6. Verifying the update:');
    const verifyResponse = await fetch(`http://localhost:5000/api/construction/divisions/${division3.id}/items`);
    
    if (!verifyResponse.ok) {
      throw new Error(`Failed to fetch items for verification: ${verifyResponse.statusText}`);
    }
    
    const updatedItems = await verifyResponse.json() as ConstructionItem[];
    const verifiedItem = updatedItems.find(item => item.id === itemToEdit.id);
    
    if (!verifiedItem) {
      throw new Error('Could not find the updated item');
    }
    
    console.log(`Verified Item ID: ${verifiedItem.id}`);
    console.log(`Verified Description: ${verifiedItem.description}`);
    console.log(`Verified Labor Cost: $${verifiedItem.laborCost?.toFixed(2) || '0.00'}`);
    console.log(`Verified Material Cost: $${verifiedItem.materialCost?.toFixed(2) || '0.00'}`);
    console.log(`Verified Total Cost: $${verifiedItem.totalCost?.toFixed(2) || '0.00'}`);
    
    // 7. Restore the original item
    console.log('\n7. Restoring the original item:');
    const restoreResponse = await fetch(`http://localhost:5000/api/construction/items/${itemToEdit.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemToEdit),
    });
    
    if (!restoreResponse.ok) {
      const errorData = await restoreResponse.json().catch(() => null);
      throw new Error(errorData?.message || `Error restoring item: ${restoreResponse.statusText}`);
    }
    
    const restoredItem = await restoreResponse.json();
    console.log('Restore successful!');
    console.log(`Restored Item ID: ${restoredItem.id}`);
    console.log(`Restored Description: ${restoredItem.description}`);
    console.log(`Restored Labor Cost: $${restoredItem.laborCost?.toFixed(2) || '0.00'}`);
    console.log(`Restored Material Cost: $${restoredItem.materialCost?.toFixed(2) || '0.00'}`);
    console.log(`Restored Total Cost: $${restoredItem.totalCost?.toFixed(2) || '0.00'}`);
    
    console.log('\nEdit Item Test completed successfully!');
  } catch (error) {
    console.error('Error testing Edit Item functionality:', error);
  }
}

// Run the test
testEditItem();
