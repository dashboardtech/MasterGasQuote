import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import type { ConstructionDivision, ConstructionItem } from '../../../../shared/schema';

// Construction Items page for a specific division
export default function ConstructionDivisionItems() {
  const params = useParams();
  const id = params?.id;
  const [, setLocation] = useLocation();
  
  const [division, setDivision] = useState<ConstructionDivision | null>(null);
  const [items, setItems] = useState<ConstructionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // For form inputs
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    code: '',
    description: '',
    quantity: 1,
    unit: 'ea',
    laborCost: 0,
    materialCost: 0,
    notes: ''
  });

  // Fetch division details and items on component mount
  useEffect(() => {
    if (!id) return;
    
    const fetchDivisionAndItems = async () => {
      try {
        setLoading(true);
        
        // Fetch division details
        const divisionResponse = await fetch('/api/construction/divisions');
        if (!divisionResponse.ok) {
          throw new Error(`Error fetching division: ${divisionResponse.statusText}`);
        }
        
        const allDivisions = await divisionResponse.json();
        const currentDivision = allDivisions.find((div: ConstructionDivision) => div.id === Number(id));
        
        if (!currentDivision) {
          throw new Error('Division not found');
        }
        
        setDivision(currentDivision);
        
        // Fetch items for this division
        const itemsResponse = await fetch(`/api/construction/divisions/${id}/items`);
        if (!itemsResponse.ok) {
          throw new Error(`Error fetching items: ${itemsResponse.statusText}`);
        }
        
        const itemsData = await itemsResponse.json();
        setItems(itemsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch division data:', err);
        setError('Failed to load division data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDivisionAndItems();
  }, [id]);

  // Group items by category (from notes field)
  const groupedItems = items.reduce((groups, item) => {
    const category = item.notes || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {} as Record<string, ConstructionItem[]>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort();

  // Calculate total costs
  const totalLaborCost = items.reduce((sum, item) => sum + (item.laborCost || 0), 0);
  const totalMaterialCost = items.reduce((sum, item) => sum + (item.materialCost || 0), 0);
  const totalCost = totalLaborCost + totalMaterialCost;
  
  // Calculate category subtotals
  const categoryTotals = Object.entries(groupedItems).reduce((totals, [category, categoryItems]) => {
    totals[category] = {
      laborCost: categoryItems.reduce((sum, item) => sum + (item.laborCost || 0), 0),
      materialCost: categoryItems.reduce((sum, item) => sum + (item.materialCost || 0), 0),
      totalCost: categoryItems.reduce((sum, item) => sum + (item.totalCost || 0), 0),
    };
    return totals;
  }, {} as Record<string, { laborCost: number; materialCost: number; totalCost: number }>);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields with validation
    if (name === 'laborCost' || name === 'materialCost' || name === 'quantity') {
      const numValue = value === '' ? 0 : Number(value);
      // Prevent negative values
      if (numValue < 0) return;
      
      setNewItem({
        ...newItem,
        [name]: numValue,
        // Auto-calculate total cost when labor or material costs change
        ...(name === 'laborCost' || name === 'materialCost' ? {
          totalCost: name === 'laborCost' 
            ? numValue + (newItem.materialCost || 0)
            : (newItem.laborCost || 0) + numValue
        } : {})
      });
    } else {
      setNewItem({
        ...newItem,
        [name]: value
      });
    }
  };

  // Form validation
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!newItem.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (newItem.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    
    if (newItem.laborCost < 0) {
      errors.laborCost = 'Labor cost cannot be negative';
    }
    
    if (newItem.materialCost < 0) {
      errors.materialCost = 'Material cost cannot be negative';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Start editing an item
  const handleEditItem = (item: ConstructionItem) => {
    setNewItem({
      code: item.code || '',
      description: item.description,
      quantity: item.quantity || 1,
      unit: item.unit || 'ea',
      laborCost: item.laborCost || 0,
      materialCost: item.materialCost || 0,
      notes: item.notes || ''
    });
    setEditItemId(item.id);
    setIsEditingItem(true);
    setIsAddingItem(false);
    setFormErrors({});
    setError(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditingItem(false);
    setEditItemId(null);
    setNewItem({
      code: '',
      description: '',
      quantity: 1,
      unit: 'ea',
      laborCost: 0,
      materialCost: 0,
      notes: ''
    });
    setFormErrors({});
  };

  // Update an existing item
  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !editItemId) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total cost before sending
      const itemToUpdate = {
        ...newItem,
        totalCost: (newItem.laborCost || 0) + (newItem.materialCost || 0)
      };
      
      const response = await fetch(`/api/construction/items/${editItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToUpdate),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error updating item: ${response.statusText}`);
      }
      
      const updatedItem = await response.json();
      
      // Update the items list with the updated item
      setItems(items.map(item => item.id === editItemId ? updatedItem : item));
      
      // Reset form and editing state
      setNewItem({
        code: '',
        description: '',
        quantity: 1,
        unit: 'ea',
        laborCost: 0,
        materialCost: 0,
        notes: ''
      });
      
      setFormErrors({});
      setIsEditingItem(false);
      setEditItemId(null);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to update item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add new item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Calculate total cost before sending
      const itemToAdd = {
        ...newItem,
        totalCost: (newItem.laborCost || 0) + (newItem.materialCost || 0)
      };
      
      const response = await fetch(`/api/construction/divisions/${id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemToAdd),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error adding item: ${response.statusText}`);
      }
      
      const addedItem = await response.json();
      
      // Update the items list with the new item
      setItems([...items, addedItem]);
      
      // Reset form
      setNewItem({
        code: '',
        description: '',
        quantity: 1,
        unit: 'ea',
        laborCost: 0,
        materialCost: 0,
        notes: ''
      });
      
      setFormErrors({});
      setIsAddingItem(false);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to add item:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete an item
  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/construction/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting item: ${response.statusText}`);
      }
      
      // Remove the deleted item from the list
      setItems(items.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => setLocation('/construction')}
            type="button"
            className="text-blue-500 hover:text-blue-700 mb-2"
          >
            ← Back to Divisions
          </button>
          {division && (
            <h1 className="text-2xl font-bold">
              Division {division.divisionNumber}: {division.name}
            </h1>
          )}
        </div>
        <button 
          onClick={() => {
            if (isEditingItem) {
              handleCancelEdit();
            } else {
              setIsAddingItem(!isAddingItem);
            }
          }}
          type="button"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          {isAddingItem || isEditingItem ? 'Cancel' : 'Add Item'}
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Add/Edit Item Form */}
      {(isAddingItem || isEditingItem) && (
        <div className="bg-gray-50 p-4 mb-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">
            {isEditingItem ? 'Edit Construction Item' : 'Add New Construction Item'}
          </h2>
          <form onSubmit={isEditingItem ? handleUpdateItem : handleAddItem}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={newItem.code}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., 01 41 26"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={newItem.description}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${formErrors.description ? 'border-red-500' : ''}`}
                  placeholder="Item description"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                )}
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={newItem.quantity}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${formErrors.quantity ? 'border-red-500' : ''}`}
                  min="0"
                  step="0.01"
                />
                {formErrors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.quantity}</p>
                )}
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={newItem.unit}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="ea">each (ea)</option>
                  <option value="m2">square meter (m2)</option>
                  <option value="m3">cubic meter (m3)</option>
                  <option value="m">meter (m)</option>
                  <option value="kg">kilogram (kg)</option>
                  <option value="ton">ton</option>
                  <option value="lot">lot</option>
                </select>
              </div>
              <div>
                <label htmlFor="laborCost" className="block text-sm font-medium text-gray-700 mb-1">Labor Cost</label>
                <input
                  type="number"
                  id="laborCost"
                  name="laborCost"
                  value={newItem.laborCost}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${formErrors.laborCost ? 'border-red-500' : ''}`}
                  min="0"
                  step="0.01"
                />
                {formErrors.laborCost && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.laborCost}</p>
                )}
              </div>
              <div>
                <label htmlFor="materialCost" className="block text-sm font-medium text-gray-700 mb-1">Material Cost</label>
                <input
                  type="number"
                  id="materialCost"
                  name="materialCost"
                  value={newItem.materialCost}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded ${formErrors.materialCost ? 'border-red-500' : ''}`}
                  min="0"
                  step="0.01"
                />
                {formErrors.materialCost && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.materialCost}</p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Category/Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={newItem.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Enter a category for grouping similar items (e.g., 'Concrete Work', 'Electrical', etc.)"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isEditingItem) {
                    handleCancelEdit();
                  } else {
                    setIsAddingItem(false);
                    setFormErrors({});
                  }
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </>
                ) : isEditingItem ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary */}
      {!loading && items.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Labor Cost</p>
              <p className="text-lg font-medium">${totalLaborCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Material Cost</p>
              <p className="text-lg font-medium">${totalMaterialCost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-lg font-medium">${totalCost.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500">No items found for this division.</p>
      )}

      {items.length > 0 && (
        <div className="space-y-8">
          {sortedCategories.map(category => (
            <div key={category} className="bg-white rounded-lg shadow-sm overflow-hidden border">
              <div className="bg-gray-100 p-3 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <h3 className="text-lg font-semibold">{category}</h3>
                <div className="text-sm flex flex-wrap gap-3">
                  <span>Labor: <span className="font-medium">${categoryTotals[category].laborCost.toFixed(2)}</span></span>
                  <span>Material: <span className="font-medium">${categoryTotals[category].materialCost.toFixed(2)}</span></span>
                  <span>Total: <span className="font-medium">${categoryTotals[category].totalCost.toFixed(2)}</span></span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-2 px-4 border-b text-left">Code</th>
                      <th className="py-2 px-4 border-b text-left">Description</th>
                      <th className="py-2 px-4 border-b text-right">Quantity</th>
                      <th className="py-2 px-4 border-b text-left">Unit</th>
                      <th className="py-2 px-4 border-b text-right">Labor Cost</th>
                      <th className="py-2 px-4 border-b text-right">Material Cost</th>
                      <th className="py-2 px-4 border-b text-right">Total Cost</th>
                      <th className="py-2 px-4 border-b text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedItems[category].map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 border-b last:border-b-0">
                        <td className="py-2 px-4">{item.code || '-'}</td>
                        <td className="py-2 px-4">{item.description}</td>
                        <td className="py-2 px-4 text-right">{item.quantity}</td>
                        <td className="py-2 px-4">{item.unit || '-'}</td>
                        <td className="py-2 px-4 text-right">${item.laborCost?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-4 text-right">${item.materialCost?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-4 text-right">${item.totalCost?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-4 text-center">
                          <div className="flex space-x-3 justify-center">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit item"
                              type="button"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => item.id && handleDeleteItem(item.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete item"
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
