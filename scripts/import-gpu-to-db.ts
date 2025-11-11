/**
 * Import GPU data from JSON to database
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { bulkInsertGPUs } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importGPUData() {
  const jsonPath = path.join(__dirname, '../server/gpu-data.json');
  
  console.log('Reading GPU data from:', jsonPath);
  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  
  // Skip the first two lines (log messages)
  const lines = jsonData.split('\n');
  const jsonStartIndex = lines.findIndex(line => line.trim() === '[');
  const jsonContent = lines.slice(jsonStartIndex).join('\n');
  
  const gpuData = JSON.parse(jsonContent);
  
  console.log(`Found ${gpuData.length} GPUs in JSON file`);
  
  // Filter and prepare data for database
  const gpusToInsert = gpuData.map((gpu: any) => ({
    modelName: gpu.modelName,
    manufacturer: gpu.manufacturer || null,
    vramCapacityGB: gpu.vramCapacityGB,
    architecture: gpu.architecture || null,
    releaseYear: gpu.releaseYear || null,
  }));
  
  console.log('Inserting GPUs into database...');
  await bulkInsertGPUs(gpusToInsert);
  
  console.log(`Successfully imported ${gpusToInsert.length} GPUs`);
}

importGPUData().catch(error => {
  console.error('Error importing GPU data:', error);
  process.exit(1);
});
