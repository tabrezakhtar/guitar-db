const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
const moment = require("moment");

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

function colorizeJson(obj, indent = 0) {
  const spaces = '  '.repeat(indent)
  
  if (obj === null) return `${colors.gray}null${colors.reset}`
  if (typeof obj === 'string') return `${colors.green}"${obj}"${colors.reset}`
  if (typeof obj === 'number') return `${colors.yellow}${obj}${colors.reset}`
  if (typeof obj === 'boolean') return `${colors.magenta}${obj}${colors.reset}`
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    const items = obj.map(item => `${spaces}  ${colorizeJson(item, indent + 1)}`).join(',\n')
    return `[\n${items}\n${spaces}]`
  }
  
  if (typeof obj === 'object') {
    const keys = Object.keys(obj)
    if (keys.length === 0) return '{}'
    
    const items = keys.map(key => {
      const coloredKey = `${colors.cyan}"${key}"${colors.reset}`
      const coloredValue = colorizeJson(obj[key], indent + 1)
      return `${spaces}  ${coloredKey}: ${coloredValue}`
    }).join(',\n')
    
    return `{\n${items}\n${spaces}}`
  }
  
  return String(obj)
}

async function viewLastLogs() {
  let client = null

  try {
    const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/guitar-db'
    client = new MongoClient(uri)
    await client.connect()
    const db = client.db()
    
    console.log(`${colors.bright}${colors.blue}Fetching last 20 log events...${colors.reset}\n`)
    
    const logs = await db.collection('logs')
      .find({})
      .sort({ timestamp: -1 })
      .limit(50)
      .toArray()
    
    if (logs.length === 0) {
      console.log(`${colors.yellow}No logs found.${colors.reset}`)
      return
    }
    
    console.log(`${colors.bright}Found ${colors.yellow}${logs.length}${colors.reset}${colors.bright} log events:${colors.reset}\n`)
    
    logs.forEach((log, index) => {
      const logForDisplay = {
        _id: log._id.toString(),
        message: log.message,
        action: log.action || null,
        error: log.error || null,
        timestamp: moment(log.timestamp).fromNow()
      }
      
      console.log(colorizeJson(logForDisplay))
      console.log('')
    })
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

viewLastLogs()