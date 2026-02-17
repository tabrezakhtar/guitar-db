const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { deleteUserProfile } = require("../routes/profile");

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m"
};

async function clearGuestUsers() {
  try {
    const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/guitar-db";
    
    console.log(`${colors.bright}${colors.blue}Connecting to database...${colors.reset}\n`);
    
    await mongoose.connect(uri, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    
    console.log(`${colors.green}✓ Connected to database${colors.reset}\n`);
    
    const User = require("../models/user");
    
    console.log(`${colors.bright}${colors.blue}Finding guest users...${colors.reset}`);
    
    const guestUsers = await User.find({ guest: true }).select("_id username email");
    
    if (guestUsers.length === 0) {
      console.log(`${colors.yellow}No guest users found${colors.reset}`);
      await mongoose.connection.close();
      return;
    }
    
    console.log(`${colors.bright}Found ${colors.yellow}${guestUsers.length}${colors.reset}${colors.bright} guest user(s) to delete${colors.reset}\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of guestUsers) {
      try {
        console.log(`${colors.gray}Deleting guest user: ${colors.cyan}${user.username}${colors.reset} (${user._id})`);
        
        const mockReq = {
          body: {
            userId: user._id.toString()
          }
        };
        
        let deleteResult = null;
        const mockRes = {
          cookies: {},
          cookie: (name, value, opts) => {
            mockRes.cookies[name] = { value, opts };
            return mockRes;
          },
          status: (code) => ({
            json: (data) => {
              deleteResult = data;
              return mockRes;
            }
          })
        };
        
        const mockNext = (error) => {
          throw error;
        };
        
        await deleteUserProfile(mockReq, mockRes, mockNext);
        
        if (deleteResult) {
          console.log(`${colors.green}✓ Deleted ${user.username} - ${deleteResult.deletedEquipment} equipment, ${deleteResult.deletedImages} images${colors.reset}`);
          successCount++;
        }
      } catch (error) {
        console.error(`${colors.red}✗ Failed to delete ${user.username}: ${error.message}${colors.reset}`);
        errorCount++;
      }
    }
    
    console.log(`\n${colors.bright}${colors.green}✓ Guest user cleanup completed!${colors.reset}`);
    console.log(`${colors.green}Successfully deleted: ${successCount}${colors.reset}`);
    if (errorCount > 0) {
      console.log(`${colors.red}Failed: ${errorCount}${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}Error during guest cleanup: ${error.message}${colors.reset}`);
  } finally {
    await mongoose.connection.close();
    console.log(`\n${colors.gray}Database connection closed${colors.reset}`);
  }
}

clearGuestUsers();
