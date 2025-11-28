const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

async function syncTags() {
  let client = null;

  try {
    const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/guitar-db";
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    console.log("Connected to database, starting tag sync...");
    
    // Get all equipment items
    const equipmentCollection = db.collection("equipment");
    const tagsCollection = db.collection("tags");
    
    // Reset all tag counts to 0
    await tagsCollection.updateMany({}, { $set: { count: 0 } });
    console.log("Reset all tag counts to 0");
    
    // Get all equipment with tags
    const equipment = await equipmentCollection.find({ tags: { $exists: true, $ne: [] } }).toArray();
    console.log(`Found ${equipment.length} equipment items with tags`);
    
    // Count tag occurrences
    const tagCounts = {};
    
    for (const item of equipment) {
      if (item.tags && Array.isArray(item.tags)) {
        for (const tagId of item.tags) {
          const tagIdStr = tagId.toString();
          tagCounts[tagIdStr] = (tagCounts[tagIdStr] || 0) + 1;
        }
      }
    }
    
    console.log(`Counted ${Object.keys(tagCounts).length} unique tags`);
    
    // Update tag counts in the tags collection
    let updatedCount = 0;
    for (const [tagId, count] of Object.entries(tagCounts)) {
      try {
        const result = await tagsCollection.updateOne(
          { _id: new ObjectId(tagId) },
          { $set: { count: count } }
        );
        
        if (result.modifiedCount > 0) {
          updatedCount++;
          console.log(`Updated tag ${tagId} with count: ${count}`);
        }
      } catch (error) {
        console.error(`Error updating tag ${tagId}:`, error.message);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} tags`);
    console.log("Tag sync completed!");
    
  } catch (error) {
    console.error("Error syncing tags:", error);
  } finally {
    if (client) {
      await client.close();
      console.log("Database connection closed");
    }
  }
}

syncTags();
