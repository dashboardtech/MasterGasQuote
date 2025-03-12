import { db } from '../server/db';
import { sqliteDb } from '../server/db';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  users, 
  quotes, 
  components, 
  constructionDivisions, 
  constructionItems 
} from '../shared/schema';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up SQLite database file path
const dbPath = join(__dirname, '..', 'gas_station_quotes.db');

// Import seed functions
import * as constructionSeed from './seed-construction-data';

// Demo user data
const demoUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'demo', password: 'demo123' }
];

// Sample quotes for demonstration
const demoQuotes = [
  {
    name: 'Gas Station Project ABC',
    client: 'ABC Corporation',
    location: 'San Francisco, CA',
    completionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
    notes: 'New construction project for a premium gas station with convenience store',
    status: 'draft'
  },
  {
    name: 'XYZ Gas Renovation',
    client: 'XYZ Enterprises',
    location: 'Miami, FL',
    completionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
    notes: 'Renovation of existing gas station to add new pumps and canopy',
    status: 'in_progress'
  }
];

/**
 * Initialize database tables
 */
async function initializeTables() {
  console.log('Initializing database tables...');
  
  try {
    // Create tables explicitly if they don't exist
    await sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS quotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        client TEXT,
        location TEXT,
        completion_date TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'draft',
        timeline TEXT,
        site_specific_factors TEXT,
        vendors TEXT,
        operational_costs TEXT
      );
      
      CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quote_id INTEGER NOT NULL,
        parent_id INTEGER,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        configuration TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_cost REAL NOT NULL,
        total_cost REAL NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS construction_divisions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        division_number TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT
      );
      
      CREATE TABLE IF NOT EXISTS construction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        division_id INTEGER NOT NULL,
        code TEXT,
        description TEXT NOT NULL,
        quantity REAL DEFAULT 1,
        unit TEXT NOT NULL,
        labor_cost REAL NOT NULL,
        material_cost REAL NOT NULL,
        total_cost REAL NOT NULL
      );
    `);
    
    console.log('Tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing tables:', error);
    return false;
  }
}

/**
 * Seed demo users
 */
async function seedUsers() {
  try {
    console.log('Checking for existing users...');
    const existingUsers = await db.select().from(users);
    
    if (existingUsers.length === 0) {
      console.log('Seeding demo users...');
      const result = await db.insert(users).values(demoUsers);
      console.log(`Added ${demoUsers.length} demo users`);
    } else {
      console.log(`Found ${existingUsers.length} existing users, skipping user seeding`);
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding users:', error);
    return false;
  }
}

/**
 * Seed demo quotes
 */
async function seedQuotes() {
  try {
    console.log('Checking for existing quotes...');
    const existingQuotes = await db.select().from(quotes);
    
    if (existingQuotes.length === 0) {
      console.log('Seeding demo quotes...');
      
      // Add current date functions
      const now = new Date().toISOString();
      const quotesWithDates = demoQuotes.map(quote => ({
        ...quote,
        createdAt: now,
        updatedAt: now
      }));
      
      const result = await db.insert(quotes).values(quotesWithDates);
      console.log(`Added ${demoQuotes.length} demo quotes`);
    } else {
      console.log(`Found ${existingQuotes.length} existing quotes, skipping quote seeding`);
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding quotes:', error);
    return false;
  }
}

/**
 * Add demo components to the first quote
 */
async function seedDemoComponents() {
  try {
    console.log('Checking for existing components...');
    const existingComponents = await db.select().from(components);
    
    if (existingComponents.length === 0) {
      console.log('Getting first quote ID...');
      const firstQuote = await db.select().from(quotes).limit(1);
      
      if (firstQuote.length > 0) {
        const quoteId = firstQuote[0].id;
        
        console.log(`Seeding demo components for quote ID ${quoteId}...`);
        
        // Create a tank component
        const tankComponent = {
          quoteId,
          type: 'tank',
          name: '10,000 Gallon Underground Tank',
          description: 'Double-wall fiberglass underground storage tank',
          configuration: JSON.stringify({
            capacity: '10000',
            material: 'fiberglass',
            manpower: [
              { role: 'Installer', hourlyRate: 45, hours: 24, quantity: 2 },
              { role: 'Supervisor', hourlyRate: 65, hours: 12, quantity: 1 }
            ]
          }),
          quantity: 2,
          unitCost: 25000,
          totalCost: 50000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create a dispenser component
        const dispenserComponent = {
          quoteId,
          type: 'dispenser',
          name: 'Multi-Product Dispenser',
          description: 'Multi-product fuel dispenser with card reader',
          configuration: JSON.stringify({
            model: 'QuantiumT500',
            hoses: 4,
            manpower: [
              { role: 'Technician', hourlyRate: 50, hours: 8, quantity: 2 },
              { role: 'Electrician', hourlyRate: 60, hours: 4, quantity: 1 }
            ]
          }),
          quantity: 4,
          unitCost: 15000,
          totalCost: 60000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Create a construction item component
        const constructionComponent = {
          quoteId,
          type: 'construction',
          name: 'Concrete Pad Installation',
          description: 'Reinforced concrete pad for dispenser islands',
          configuration: JSON.stringify({
            area: 800,
            unitMeasurement: 'sq_ft',
            thickness: 8,
            manpower: [
              { role: 'Concrete Worker', hourlyRate: 40, hours: 16, quantity: 4 },
              { role: 'Supervisor', hourlyRate: 65, hours: 8, quantity: 1 }
            ]
          }),
          quantity: 1,
          unitCost: 12000,
          totalCost: 12000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Insert components
        await db.insert(components).values([tankComponent, dispenserComponent, constructionComponent]);
        console.log('Added 3 demo components to the first quote');
      } else {
        console.log('No quotes found, skipping component seeding');
      }
    } else {
      console.log(`Found ${existingComponents.length} existing components, skipping component seeding`);
    }
    
    return true;
  } catch (error) {
    console.error('Error seeding components:', error);
    return false;
  }
}

/**
 * Main initialization function
 */
async function initializeDatabase() {
  console.log('Starting database initialization...');
  console.log(`Database path: ${dbPath}`);
  
  // Initialize tables
  const tablesInitialized = await initializeTables();
  if (!tablesInitialized) {
    console.error('Failed to initialize tables. Exiting...');
    process.exit(1);
  }
  
  // Seed users
  const usersSeeded = await seedUsers();
  if (!usersSeeded) {
    console.error('Failed to seed users. Continuing anyway...');
  }
  
  // Seed quotes
  const quotesSeeded = await seedQuotes();
  if (!quotesSeeded) {
    console.error('Failed to seed quotes. Continuing anyway...');
  }
  
  // Seed components
  const componentsSeeded = await seedDemoComponents();
  if (!componentsSeeded) {
    console.error('Failed to seed components. Continuing anyway...');
  }
  
  // Seed construction divisions and items
  try {
    console.log('Seeding construction divisions and items...');
    
    // Use the main function from the seed-construction-data module
    // This will seed all construction divisions and items
    await constructionSeed.main();
    
    console.log('Construction divisions and items seeded successfully');
  } catch (error) {
    console.error('Error seeding construction data:', error);
    console.error('Continuing with database initialization');
  }
  
  console.log('Database initialization completed successfully');
  console.log('You can now start the application with: npm run dev');
}

// Run the initialization function
initializeDatabase()
  .catch(error => {
    console.error('Uncaught error during database initialization:', error);
    process.exit(1);
  })
  .finally(() => {
    // Close the database connection when done
    sqliteDb.close();
  });
