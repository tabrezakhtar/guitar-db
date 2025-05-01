const cloudinary = require("cloudinary").v2;

function getPublicIdFromUrl(url) {
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1];
    }
    
    console.log("Regex extraction failed for URL:", url);
    const parts = url.split("/");
    const fileName = parts[parts.length - 1]; 
    return fileName.split(".")[0]; 
  } catch (err) {
    console.error("Error extracting public ID from URL:", err);
    return null;
  }
}

async function deleteCloudinaryImages(images) {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
  });

  try {
    const deletePromises = images.map((image) => {
      const publicId = getPublicIdFromUrl(image);
      console.log("publicid", publicId);
      
      if (publicId) {
        return cloudinary.uploader.destroy(publicId, { invalidate: true });
      }
      return Promise.resolve();
    });
    
    const results = await Promise.all(deletePromises);
    console.log(results);
    return results;
  } catch (err) {
    console.log({ message: err.message });
  }
}

module.exports = { deleteCloudinaryImages };