// Test script for the quoting system
import type { InsertQuote, Quote } from '../shared/schema';

// Main test function
async function testQuoteSystem() {
  console.log('Testing Quote System Functionality...\n');

  try {
    // 1. Fetch all quotes
    console.log('1. Fetching all quotes:');
    const quotes = await fetchQuotes();
    console.log(`Found ${quotes.length} quotes\n`);
    
    // 2. Test creating a quote with minimal fields
    console.log('2. Testing quote creation with minimal fields:');
    const minimalQuote: InsertQuote = {
      name: 'Test Quote - Minimal',
      client: 'Test Client',
      location: 'Test Location',
      status: 'draft',
      // Explicitly set JSON fields to null
      timeline: null,
      siteSpecificFactors: null,
      vendors: null,
      operationalCosts: null
    };
    
    console.log('Quote payload:', JSON.stringify(minimalQuote, null, 2));
    
    try {
      const newQuote = await createQuote(minimalQuote);
      console.log('Quote created successfully!');
      console.log('New quote:', JSON.stringify(newQuote, null, 2));
    } catch (error) {
      console.error('Failed to create quote with minimal fields:', error);
      
      // 3. Test with stringified JSON fields
      console.log('\n3. Testing quote creation with stringified JSON fields:');
      const stringifiedQuote: any = {
        name: 'Test Quote - Stringified',
        client: 'Test Client',
        location: 'Test Location',
        status: 'draft',
        // Use empty JSON strings instead of null
        timeline: JSON.stringify({}),
        siteSpecificFactors: JSON.stringify({}),
        vendors: JSON.stringify([]),
        operationalCosts: JSON.stringify({})
      };
      
      console.log('Quote payload with stringified JSON:', JSON.stringify(stringifiedQuote, null, 2));
      
      try {
        const newQuote = await createQuote(stringifiedQuote);
        console.log('Quote created successfully with stringified JSON!');
        console.log('New quote:', JSON.stringify(newQuote, null, 2));
      } catch (error) {
        console.error('Failed to create quote with stringified JSON fields:', error);
        
        // 4. Test with empty objects
        console.log('\n4. Testing quote creation with empty objects:');
        const emptyObjectsQuote: any = {
          name: 'Test Quote - Empty Objects',
          client: 'Test Client',
          location: 'Test Location',
          status: 'draft',
          // Use empty objects/arrays
          timeline: {},
          siteSpecificFactors: {},
          vendors: [],
          operationalCosts: {}
        };
        
        console.log('Quote payload with empty objects:', JSON.stringify(emptyObjectsQuote, null, 2));
        
        try {
          const newQuote = await createQuote(emptyObjectsQuote);
          console.log('Quote created successfully with empty objects!');
          console.log('New quote:', JSON.stringify(newQuote, null, 2));
        } catch (error) {
          console.error('Failed to create quote with empty objects:', error);
          
          // 5. Test with undefined JSON fields
          console.log('\n5. Testing quote creation with undefined JSON fields:');
          const undefinedFieldsQuote: any = {
            name: 'Test Quote - Undefined Fields',
            client: 'Test Client',
            location: 'Test Location',
            status: 'draft'
            // Omit JSON fields entirely
          };
          
          console.log('Quote payload with undefined JSON fields:', JSON.stringify(undefinedFieldsQuote, null, 2));
          
          try {
            const newQuote = await createQuote(undefinedFieldsQuote);
            console.log('Quote created successfully with undefined JSON fields!');
            console.log('New quote:', JSON.stringify(newQuote, null, 2));
          } catch (error) {
            console.error('Failed to create quote with undefined JSON fields:', error);
            console.error('All attempts to create a quote have failed.');
          }
        }
      }
    }
    
    console.log('\nQuote System Test completed!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Helper function to fetch all quotes
async function fetchQuotes(): Promise<Quote[]> {
  const response = await fetch('http://localhost:5000/api/quotes');
  if (!response.ok) {
    throw new Error(`Failed to fetch quotes: ${response.statusText}`);
  }
  return await response.json();
}

// Helper function to create a quote
async function createQuote(quote: any): Promise<Quote> {
  const response = await fetch('http://localhost:5000/api/quotes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(quote),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create quote: ${response.statusText}\n${errorText}`);
  }
  
  return await response.json();
}

// Run the test
testQuoteSystem().catch(console.error);
