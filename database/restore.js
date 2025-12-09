const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

function convertObjectIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIds);
  } else if (obj !== null && typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (key === '_id' || key.endsWith('Id') || key === 'user' || key === 'equipmentId') {
        if (typeof obj[key] === 'string' && obj[key].length === 24) {
          try {
            newObj[key] = new ObjectId(obj[key]);
          } catch {
            newObj[key] = obj[key];
          }
        } else {
          newObj[key] = obj[key];
        }
      } else if (key === 'likes' || key === 'comments' || key === 'tags') {
        if (Array.isArray(obj[key])) {
          newObj[key] = obj[key].map(item => {
            if (typeof item === 'string' && item.length === 24) {
              try {
                return new ObjectId(item);
              } catch {
                return item;
              }
            }
            return convertObjectIds(item);
          });
        } else {
          newObj[key] = obj[key];
        }
      } else {
        newObj[key] = convertObjectIds(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

async function getAvailableBackups() {
  const backupDir = path.join(__dirname, 'data_backup');
  
  if (!fs.existsSync(backupDir)) {
    console.log(`${colors.red}No backup directory found at: ${backupDir}${colors.reset}`);
    return [];
  }
  
  const folders = fs.readdirSync(backupDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => b.localeCompare(a)); // Sort newest first
  
  return folders;
}

async function restoreDatabase(backupFolderName = null) {
  let client = null;
  
  try {
    const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/guitar-db";
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    console.log(`${colors.bright}${colors.blue}Starting database restore...${colors.reset}\n`);
    
    // Get available backups
    const availableBackups = await getAvailableBackups();
    
    if (availableBackups.length === 0) {
      console.log(`${colors.red}No backups found in data_backup folder${colors.reset}`);
      return;
    }
    
    // Select backup to restore
    let selectedBackup;
    if (backupFolderName) {
      if (!availableBackups.includes(backupFolderName)) {
        console.log(`${colors.red}Backup '${backupFolderName}' not found${colors.reset}`);
        console.log(`${colors.cyan}Available backups:${colors.reset}`);
        availableBackups.forEach((backup, index) => {
          console.log(`  ${index + 1}. ${backup}`);
        });
        return;
      }
      selectedBackup = backupFolderName;
    } else {
      // Use the most recent backup
      selectedBackup = availableBackups[0];
      console.log(`${colors.cyan}Using most recent backup: ${selectedBackup}${colors.reset}`);
    }
    
    const backupPath = path.join(__dirname, 'data_backup', selectedBackup);
    
    // Check if backup-info.json exists
    const backupInfoPath = path.join(backupPath, 'backup-info.json');
    if (fs.existsSync(backupInfoPath)) {
      const backupInfo = JSON.parse(fs.readFileSync(backupInfoPath, 'utf8'));
      console.log(`${colors.gray}Backup created: ${backupInfo.timestamp}${colors.reset}`);
      console.log(`${colors.gray}Collections: ${backupInfo.collections}${colors.reset}\n`);
    }
    
    // Get all JSON files in the backup directory
    const jsonFiles = fs.readdirSync(backupPath)
      .filter(file => file.endsWith('.json') && file !== 'backup-info.json');
    
    console.log(`${colors.bright}Found ${colors.yellow}${jsonFiles.length}${colors.reset}${colors.bright} collection files to restore${colors.reset}`);
    
    // Warning about data overwrite
    console.log(`${colors.yellow}⚠️  WARNING: This will replace all existing data in the database!${colors.reset}\n`);
    
    for (const jsonFile of jsonFiles) {
      const collectionName = path.basename(jsonFile, '.json');
      const filePath = path.join(backupPath, jsonFile);
      
      console.log(`${colors.gray}Restoring collection: ${colors.cyan}${collectionName}${colors.reset}`);
      
      try {
        // Read and parse the JSON file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const documents = JSON.parse(fileContent);
        
        if (!Array.isArray(documents) || documents.length === 0) {
          console.log(`${colors.yellow}  ⚠️  Skipping empty collection${colors.reset}`);
          continue;
        }
        
        // Convert string IDs back to ObjectIds
        const processedDocuments = convertObjectIds(documents);
        
        // Drop existing collection and recreate
        try {
          await db.collection(collectionName).drop();
        } catch {
          // Collection might not exist, which is fine
        }
        
        // Insert the documents
        await db.collection(collectionName).insertMany(processedDocuments);
        
        console.log(`${colors.green}✓ Restored ${documents.length} documents${colors.reset}`);
        
      } catch (fileError) {
        console.log(`${colors.red}✗ Error restoring ${collectionName}: ${fileError.message}${colors.reset}`);
      }
    }
    
    console.log(`\n${colors.bright}${colors.green}✓ Database restore completed successfully!${colors.reset}`);
    console.log(`${colors.cyan}Restored from: ${backupPath}${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error during restore: ${error.message}${colors.reset}`);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Check if a specific backup folder was provided as command line argument
const backupFolderName = process.argv[2];

if (process.argv.includes('--list')) {
  // List available backups
  (async () => {
    const backups = await getAvailableBackups();
    console.log(`${colors.cyan}Available backups:${colors.reset}`);
    backups.forEach((backup, index) => {
      console.log(`  ${index + 1}. ${backup}`);
    });
  })();
} else {
  restoreDatabase(backupFolderName);
}
