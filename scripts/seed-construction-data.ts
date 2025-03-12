import { db } from '../server/db';
import { constructionDivisions, constructionItems } from '../shared/schema';
import { eq } from 'drizzle-orm';

// Insert construction divisions
async function seedConstructionDivisions() {
  console.log('Seeding construction divisions...');
  
  const divisions = [
    { divisionNumber: '1', name: 'Requisitos Generales', description: 'Requisitos generales para la construcción' },
    { divisionNumber: '3', name: 'Concreto', description: 'Trabajos de concreto' },
    { divisionNumber: '4', name: 'Albañilería', description: 'Trabajos de albañilería' },
    { divisionNumber: '5', name: 'Metales', description: 'Trabajos con metales' },
    { divisionNumber: '8', name: 'Puertas y Ventanas', description: 'Instalación de puertas y ventanas' },
    { divisionNumber: '9', name: 'Acabados', description: 'Trabajos de acabados' },
    { divisionNumber: '10', name: 'Especialidades', description: 'Trabajos especializados' },
    { divisionNumber: '11', name: 'Equipamiento', description: 'Equipamiento para el proyecto' },
    { divisionNumber: '22', name: 'Plomería', description: 'Trabajos de plomería' },
    { divisionNumber: '23', name: 'Aire Acondicionado y Ventilación', description: 'Sistemas de aire acondicionado y ventilación' },
    { divisionNumber: '26', name: 'Sistemas Eléctricos', description: 'Instalaciones eléctricas' },
    { divisionNumber: '27', name: 'Comunicaciones', description: 'Sistemas de comunicación' },
    { divisionNumber: '28', name: 'Seguridad Electrónica', description: 'Sistemas de seguridad electrónica' },
    { divisionNumber: '31', name: 'Trabajos de Terreno', description: 'Preparación y trabajos de terreno' },
    { divisionNumber: '32', name: 'Mejoras Externas', description: 'Mejoras en áreas externas' },
    { divisionNumber: '33', name: 'Servicios', description: 'Servicios diversos' },
  ];

  try {
    console.log('Checking for existing divisions...');
    // Get existing divisions
    const existingDivisions = await db.select().from(constructionDivisions);
    console.log(`Found ${existingDivisions.length} existing divisions`);

    // Only insert divisions that don't already exist (based on divisionNumber)
    const existingDivisionNumbers = existingDivisions.map(div => div.divisionNumber);
    const divisionsToInsert = divisions.filter(div => !existingDivisionNumbers.includes(div.divisionNumber));
    
    if (divisionsToInsert.length > 0) {
      // Insert new divisions
      const result = await db.insert(constructionDivisions).values(divisionsToInsert).returning();
      console.log(`Successfully inserted ${result.length} new divisions`);
      // Return all divisions (existing + newly inserted)
      return [...existingDivisions, ...result];
    }
    
    console.log('No new divisions to insert, using existing ones');
    return existingDivisions;
  } catch (error) {
    console.error('Error seeding construction divisions:', error);
    throw error;
  }
}

// Insert items for Division 1 (Requisitos Generales)
async function seedDivision1Items(divisionId: number) {
  console.log('Seeding Division 1 items...');
  
  // Check if items for Division 1 already exist
  try {
    const existingItems = await db.select()
      .from(constructionItems)
      .where(eq(constructionItems.divisionId, divisionId));
    
    console.log(`Found ${existingItems.length} existing items for Division 1`);
    
    if (existingItems.length > 0) {
      console.log('Items for Division 1 already exist, skipping insertion');
      return existingItems;
    }
  } catch (error) {
    console.error('Error checking existing items for Division 1:', error);
  }
  
  const division1Items = [
    {
      divisionId,
      code: '',
      description: 'Ing. Residente',
      quantity: 1,
      unit: 'ea',
      laborCost: 6048.00,
      materialCost: 0,
      totalCost: 6048.00,
    },
    {
      divisionId,
      code: '',
      description: 'Ing. de salud Ocup. Y seguridad Industrial',
      quantity: 1,
      unit: 'ea',
      laborCost: 4745.66,
      materialCost: 0,
      totalCost: 4745.66,
    },
    {
      divisionId,
      code: '',
      description: 'Celador para el proyecto',
      quantity: 1,
      unit: 'ea',
      laborCost: 5292.00,
      materialCost: 0,
      totalCost: 5292.00,
    },
    {
      divisionId,
      code: '',
      description: 'Planta Eléctrica para el proyecto (estimar 90 días)',
      quantity: 1,
      unit: 'ea',
      laborCost: 2520.00,
      materialCost: 0,
      totalCost: 2520.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de uso de Acera',
      quantity: 1,
      unit: 'ea',
      laborCost: 500.00,
      materialCost: 0,
      totalCost: 500.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Construcción de Bomberos',
      quantity: 1,
      unit: 'ea',
      laborCost: 1500.00,
      materialCost: 0,
      totalCost: 1500.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Construcción de Municipio',
      quantity: 1,
      unit: 'ea',
      laborCost: 8000.00,
      materialCost: 0,
      totalCost: 8000.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Salud',
      quantity: 1,
      unit: 'ea',
      laborCost: 150.00,
      materialCost: 0,
      totalCost: 150.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Alarma contraincendio Bomberos',
      quantity: 1,
      unit: 'ea',
      laborCost: 250.00,
      materialCost: 0,
      totalCost: 250.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Ocupación Bomberos',
      quantity: 1,
      unit: 'ea',
      laborCost: 1600.00,
      materialCost: 0,
      totalCost: 1600.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Ocupación Municipio',
      quantity: 1,
      unit: 'ea',
      laborCost: 600.00,
      materialCost: 0,
      totalCost: 600.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Certificación de Hidrocarburos Bomberos',
      quantity: 1,
      unit: 'ea',
      laborCost: 2000.00,
      materialCost: 0,
      totalCost: 2000.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de instalación de tanques de combustible',
      quantity: 1,
      unit: 'ea',
      laborCost: 1000.00,
      materialCost: 0,
      totalCost: 1000.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de instalación de lineas de combustible',
      quantity: 1,
      unit: 'ea',
      laborCost: 1000.00,
      materialCost: 0,
      totalCost: 1000.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de soldadura y electricidad Bomberos',
      quantity: 1,
      unit: 'ea',
      laborCost: 680.00,
      materialCost: 0,
      totalCost: 680.00,
    },
    {
      divisionId,
      code: '01 41 26',
      description: 'Permiso de Corte y soldadura',
      quantity: 1,
      unit: 'ea',
      laborCost: 350.00,
      materialCost: 0,
      totalCost: 350.00,
    },
    {
      divisionId,
      code: '01 51 00',
      description: 'Electricidad temporal',
      quantity: 1,
      unit: 'ea',
      laborCost: 1680.00,
      materialCost: 0,
      totalCost: 1680.00,
    },
    {
      divisionId,
      code: '01 51 36',
      description: 'Suministro de Agua',
      quantity: 1,
      unit: 'ea',
      laborCost: 672.00,
      materialCost: 0,
      totalCost: 672.00,
    },
    {
      divisionId,
      code: '01 52 00',
      description: 'Oficina del contratista para la obra',
      quantity: 1,
      unit: 'ea',
      laborCost: 3920.00,
      materialCost: 0,
      totalCost: 3920.00,
    },
    {
      divisionId,
      code: '01 52 19',
      description: 'Baños sanitarios',
      quantity: 1,
      unit: 'ea',
      laborCost: 1008.00,
      materialCost: 0,
      totalCost: 1008.00,
    },
    {
      divisionId,
      code: '01 54 1.10',
      description: 'Letrero del Proyecto',
      quantity: 1,
      unit: 'ea',
      laborCost: 392.00,
      materialCost: 0,
      totalCost: 392.00,
    },
    {
      divisionId,
      code: '01 58 13',
      description: 'Cerca Temporal',
      quantity: 1,
      unit: 'ea',
      laborCost: 2240.00,
      materialCost: 0,
      totalCost: 2240.00,
    },
    {
      divisionId,
      code: '01 58 16',
      description: 'Letrero con Información del Estudio de Impacto Ambiental',
      quantity: 1,
      unit: 'ea',
      laborCost: 224.00,
      materialCost: 0,
      totalCost: 224.00,
    },
    {
      divisionId,
      code: '01 74 19',
      description: 'Disposición y administración de desperdicios',
      quantity: 1,
      unit: 'ea',
      laborCost: 672.00,
      materialCost: 0,
      totalCost: 672.00,
    },
    {
      divisionId,
      code: '01 74 23',
      description: 'Limpieza Final',
      quantity: 1,
      unit: 'ea',
      laborCost: 784.00,
      materialCost: 0,
      totalCost: 784.00,
    },
    {
      divisionId,
      code: '01 78 33',
      description: 'Bonos y seguros',
      quantity: 1,
      unit: 'ea',
      laborCost: 2500.00,
      materialCost: 0,
      totalCost: 2500.00,
    },
    {
      divisionId,
      code: '01 78 33',
      description: 'Poliza de CARS',
      quantity: 1,
      unit: 'ea',
      laborCost: 1750.00,
      materialCost: 0,
      totalCost: 1750.00,
    },
  ];

  try {
    // Insert all items for Division 1
    const result = await db.insert(constructionItems).values(division1Items).returning();
    console.log(`Successfully inserted ${result.length} items for Division 1`);
    return result;
  } catch (error) {
    console.error('Error seeding Division 1 items:', error);
    throw error;
  }
}

// Seed items for Division 3 (Concreto)
async function seedDivision3Items(divisionId: number) {
  console.log('Seeding Division 3 items...');
  
  // Check if items for Division 3 already exist
  try {
    const existingItems = await db.select()
      .from(constructionItems)
      .where(eq(constructionItems.divisionId, divisionId));
    
    console.log(`Found ${existingItems.length} existing items for Division 3`);
    
    if (existingItems.length > 0) {
      console.log('Items for Division 3 already exist, skipping insertion');
      return existingItems;
    }
  } catch (error) {
    console.error('Error checking existing items for Division 3:', error);
  }
  
  const division3Items = [
    // 0321 00 - Refuerzo de Acero - Oficinas
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de Refuerzo de Fundaciones DE COLUMNAS internas de Oficina # 3 G-60',
      quantity: 49,
      unit: 'kg',
      laborCost: 44.00,
      materialCost: 46.00,
      totalCost: 90.00,
      notes: 'Refuerzo de Acero - Oficinas'
    },
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de Refuerzo de Fundaciones VS de Oficina # 3, #4 G-60',
      quantity: 939,
      unit: 'kg',
      laborCost: 831.00,
      materialCost: 884.00,
      totalCost: 1715.00,
      notes: 'Refuerzo de Acero - Oficinas'
    },
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de Refuerzo de BLQS RELL/ CORRIDAS FC1/FC2 de Oficina # 4 G-60',
      quantity: 578,
      unit: 'kg',
      laborCost: 511.00,
      materialCost: 544.00,
      totalCost: 1055.00,
      notes: 'Refuerzo de Acero - Oficinas'
    },
    {
      divisionId,
      code: '0321 00',
      description: 'ACERO DE PISO DE OFICINA CON MALLA ELECTROSOLDADA DE 4.5*4.5*150mm',
      quantity: 6,
      unit: 'ea',
      laborCost: 202.00,
      materialCost: 806.00,
      totalCost: 1008.00,
      notes: 'Refuerzo de Acero - Oficinas'
    },
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de refuerzo para COLMNS de oficina # 6,#5,#3 G-60',
      quantity: 553,
      unit: 'kg',
      laborCost: 489.00,
      materialCost: 520.00,
      totalCost: 1009.00,
      notes: 'Refuerzo de Acero - Oficinas'
    },
    
    // 0321 00 - Refuerzo de Acero - LOSA PLANTA ELÉCTRICA
    {
      divisionId,
      code: '0321 00',
      description: 'Acero DE # 4 G-60',
      quantity: 96,
      unit: 'kg',
      laborCost: 84.00,
      materialCost: 90.00,
      totalCost: 174.00,
      notes: 'Refuerzo de Acero - LOSA PLANTA ELÉCTRICA'
    },
    
    // 0321 00 - Refuerzo de Acero - MONOLITO DE VENTILACIÓN
    {
      divisionId,
      code: '0321 00',
      description: 'Acero DE # 4 G-60',
      quantity: 6.1,
      unit: 'kg',
      laborCost: 5.00,
      materialCost: 6.00,
      totalCost: 11.00,
      notes: 'Refuerzo de Acero - MONOLITO DE VENTILACIÓN'
    },
    
    // 0321 00 - Refuerzo de Acero - LETRERO ENTRADA Y SALIDA
    {
      divisionId,
      code: '0321 00',
      description: 'Acero DE # 4 G-60',
      quantity: 38.9,
      unit: 'kg',
      laborCost: 34.00,
      materialCost: 37.00,
      totalCost: 71.00,
      notes: 'Refuerzo de Acero - LETRERO ENTRADA Y SALIDA'
    },
    
    // 0321 00 - Refuerzo de Acero - Canopy
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de Refuerzo de Fundaciones #6, #8 G60',
      quantity: 910.255,
      unit: 'kg',
      laborCost: 805.00,
      materialCost: 856.00,
      totalCost: 1662.00,
      notes: 'Refuerzo de Acero - Canopy'
    },
    {
      divisionId,
      code: '0321 00',
      description: 'Acero de Refuerzo de Pedestales #8 G-60',
      quantity: 437,
      unit: 'kg',
      laborCost: 387.00,
      materialCost: 411.00,
      totalCost: 798.00,
      notes: 'Refuerzo de Acero - Canopy'
    },
    
    // 0331 00 - Concreto Estructural - Pavimento
    {
      divisionId,
      code: '0331 00',
      description: 'Acero de Refuerzo DE PAV de # 3 G-40',
      quantity: 4028,
      unit: 'kg',
      laborCost: 3564.00,
      materialCost: 3790.00,
      totalCost: 7354.00,
      notes: 'Concreto Estructural - Pavimento'
    },
    {
      divisionId,
      code: '0331 00',
      description: 'Acero de Refuerzo de # 4, G-60 CHAFLÁN',
      quantity: 243,
      unit: 'kg',
      laborCost: 215.00,
      materialCost: 229.00,
      totalCost: 443.00,
      notes: 'Concreto Estructural - Pavimento'
    },
    
    // 0331 00 - Concreto Estructural - Concreto
    {
      divisionId,
      code: '0331 00',
      description: 'Concreto de compresión de 3,000 psi para cordones cuneta (Resane)',
      quantity: 6.4,
      unit: 'm3',
      laborCost: 456.00,
      materialCost: 1159.00,
      totalCost: 1615.00,
      notes: 'Concreto Estructural - Concreto'
    },
    {
      divisionId,
      code: '0331 00',
      description: 'FORMALETA para cordones cunetas',
      quantity: 102.0,
      unit: 'm2',
      laborCost: 400.00,
      materialCost: 514.00,
      totalCost: 914.00,
      notes: 'Concreto Estructural - Concreto'
    },
    {
      divisionId,
      code: '0331 00',
      description: 'Concreto de compresión de 3,000 psi para CANAL aguas oleosas',
      quantity: 16.0,
      unit: 'm3',
      laborCost: 1147.00,
      materialCost: 2911.00,
      totalCost: 4058.00,
      notes: 'Concreto Estructural - Concreto'
    },
  ];

  try {
    // Insert all items for Division 3
    const result = await db.insert(constructionItems).values(division3Items).returning();
    console.log(`Successfully inserted ${result.length} items for Division 3`);
    return result;
  } catch (error) {
    console.error('Error seeding Division 3 items:', error);
    throw error;
  }
}

// Main function to run the seeding
export async function main() {
  try {
    // Seed divisions first
    const divisions = await seedConstructionDivisions();
    
    // Find Division 1 and Division 3 to get their IDs
    const division1 = divisions.find(div => div.divisionNumber === '1');
    const division3 = divisions.find(div => div.divisionNumber === '3');
    
    if (division1) {
      // Seed Division 1 items
      await seedDivision1Items(division1.id);
    } else {
      console.error('Division 1 not found in the inserted divisions');
    }

    if (division3) {
      // Seed Division 3 items
      await seedDivision3Items(division3.id);
    } else {
      console.error('Division 3 not found in the inserted divisions');
    }
    
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error in seeding process:', error);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the main function
main();
