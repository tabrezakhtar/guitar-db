const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Equipment, Comments } = require("../models/equipment");
const User = require("../models/user");

dotenv.config();

async function connectToDatabase() {
  try {
    const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/guitar-db";
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✓ Connected to database");
  } catch (error) {
    console.error(`Error connecting to database: ${error.message}`);
    process.exit(1);
  }
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomUsers(users, equipmentOwnerId, minUsers = 4) {
  // Filter out the equipment owner
  const eligibleUsers = users.filter(user => user._id.toString() !== equipmentOwnerId.toString());
  
  // Determine how many users to select (between 5 and all eligible users)
  const maxUsers = eligibleUsers.length;
  const numUsersToSelect = Math.min(maxUsers, Math.max(minUsers, Math.floor(Math.random() * maxUsers) + 1));
  
  // Shuffle and select random users
  const shuffledUsers = shuffleArray(eligibleUsers);
  return shuffledUsers.slice(0, numUsersToSelect);
}

async function insertCommentsAndLikes() {
  let equipmentProcessed = 0;
  let commentsCreated = 0;
  let likesAdded = 0;

  try {
    console.log("Starting comment and like insertion...\n");

    // Get all users and equipment
    console.log("Loading users and equipment...");
    const [users, equipment] = await Promise.all([
      User.find({}).select('_id username'),
      Equipment.find({}).populate('user', '_id username')
    ]);

    console.log(`Found ${users.length} users and ${equipment.length} equipment items\n`);

    for (const item of equipment) {
      console.log(`Processing: ${item.name} by ${item.user.username}`);

      // Get random users who can comment (excluding the owner)
      const selectedUsers = getRandomUsers(users, item.user._id);
      
      if (selectedUsers.length === 0) {
        console.log("  ⚠️  No eligible users to comment");
        continue;
      }

      console.log(`  Selected ${selectedUsers.length} users to comment and like`);

      const newComments = [];
      const newLikes = [];

      for (const user of selectedUsers) {
        // Create comment with format: brand | name | type | colour | description (first 100 chars)
        const description = item.description ? item.description.substring(0, 100) + (item.description.length > 100 ? '...' : '') : '';
        const commentText = `${item.brand || 'Unknown'} | ${item.name} | ${item.type || 'Equipment'} | ${item.colour || 'N/A'} | ${description}`;
        
        const comment = new Comments({
          equipmentId: item._id,
          user: user._id,
          text: commentText,
          date: new Date()
        });

        newComments.push(comment);
        newLikes.push(user._id);
      }

      // Save all comments for this equipment
      const savedComments = await Comments.insertMany(newComments);
      commentsCreated += savedComments.length;

      // Update equipment with new comments and likes
      const commentIds = savedComments.map(comment => comment._id);
      const existingLikes = item.likes || [];
      const existingComments = item.comments || [];

      // Merge with existing data (avoid duplicates)
      const allLikes = [...new Set([...existingLikes.map(id => id.toString()), ...newLikes.map(id => id.toString())])];
      const allComments = [...existingComments, ...commentIds];

      await Equipment.findByIdAndUpdate(item._id, {
        likes: allLikes,
        comments: allComments
      });

      likesAdded += newLikes.length;
      equipmentProcessed++;

      console.log(`  ✓ Added ${savedComments.length} comments and ${newLikes.length} likes`);
    }

    console.log("\n✓ Comment and like insertion completed!");
    console.log("Statistics:");
    console.log(`  - Equipment processed: ${equipmentProcessed}`);
    console.log(`  - Comments created: ${commentsCreated}`);
    console.log(`  - Likes added: ${likesAdded}`);

  } catch (error) {
    console.error(`Error inserting comments and likes: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    await connectToDatabase();
    await insertCommentsAndLikes();
  } catch (error) {
    console.error(`Script failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

main();
