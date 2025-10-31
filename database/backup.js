const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

dotenv.config()

// ANSI color codes
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
}



async function backupDatabase() {
  let client = null
  
  try {
    const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/guitar-db'
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    
    console.log(`${colors.bright}${colors.blue}Starting database backup...${colors.reset}\n`)
    
    // Create timestamped backup folder
    const timestamp = moment().format('DD-MM-YYYY HH-mm-ss')
    const backupDir = path.join(__dirname, 'data_backup', `${timestamp}`)
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }
    
    console.log(`${colors.cyan}Backup directory: ${backupDir}${colors.reset}`)
    
    // Get all collection names
    const collections = await db.listCollections().toArray()
    console.log(`${colors.bright}Found ${colors.yellow}${collections.length}${colors.reset}${colors.bright} collections to backup${colors.reset}`)
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name
      
      console.log(`${colors.gray}Backing up collection: ${colors.cyan}${collectionName}${colors.reset}`)
      
      // Get all documents from collection
      const documents = await db.collection(collectionName).find({}).toArray()
      
      // Convert ObjectIds to strings for JSON serialization
      const processedDocuments = documents.map(doc => {
        return JSON.parse(JSON.stringify(doc, (key, value) => {
          if (value && typeof value === 'object' && value.constructor && value.constructor.name === 'ObjectId') {
            return value.toString()
          }
          return value
        }))
      })
      
      // Write to JSON file
      const filename = `${collectionName}.json`
      const filepath = path.join(backupDir, filename)
      
      fs.writeFileSync(filepath, JSON.stringify(processedDocuments, null, 2))
      
      console.log(`${colors.green}✓ Saved ${documents.length} documents to ${filename}${colors.reset}`)
    }
    
    // Create backup info file
    const backupInfo = {
      timestamp: new Date().toISOString(),
      database: db.databaseName,
      collections: collections.length,
      backupDirectory: backupDir
    }
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    )
    
    console.log(`\n${colors.bright}${colors.green}✓ Database backup completed successfully!${colors.reset}`)
    console.log(`${colors.cyan}Backup saved to: ${backupDir}${colors.reset}`)
    
  } catch (error) {
    console.error(`${colors.red}Error during backup: ${error.message}${colors.reset}`)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

backupDatabase()