import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import type { ConstructionDivision } from '../../../../shared/schema';

// Construction Divisions list page
export default function ConstructionDivisions() {
  const [divisions, setDivisions] = useState<ConstructionDivision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch construction divisions on component mount
  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/construction/divisions');
        
        if (!response.ok) {
          throw new Error(`Error fetching divisions: ${response.statusText}`);
        }
        
        const data = await response.json();
        setDivisions(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch construction divisions:', err);
        setError('Failed to load construction divisions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDivisions();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Construction Divisions</h1>
      </div>

      {loading && <p className="text-gray-500">Loading divisions...</p>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && divisions.length === 0 && (
        <p className="text-gray-500">No construction divisions found.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {divisions.map((division) => (
          <div 
            key={division.id} 
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">
                  Division {division.divisionNumber}: {division.name}
                </h2>
                {division.description && (
                  <p className="text-gray-600 mt-1">{division.description}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Link 
                to={`/construction/divisions/${division.id}`}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded inline-block"
              >
                View Items
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
