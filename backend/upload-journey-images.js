require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImages = async () => {
  const images = [
    { path: './journey-images/day-we-met.jpg', public_id: 'journey-day-we-met' },
    { path: './journey-images/became-friends.jpg', public_id: 'journey-became-friends' },
    { path: './journey-images/memories-created.jpg', public_id: 'journey-memories-created' },
    { path: './journey-images/smiles-you-gave.jpg', public_id: 'journey-smiles-you-gave' },
    { path: './journey-images/moments-forever.jpg', public_id: 'journey-moments-forever' },
  ];

  for (const img of images) {
    try {
      const result = await cloudinary.uploader.upload(img.path, {
        folder: 'asrithas_world',
        public_id: img.public_id,
        overwrite: true,
      });
      console.log(`✅ Uploaded: ${result.public_id}`);
    } catch (error) {
      console.error(`❌ Failed to upload ${img.path}:`, error.message);
    }
  }
};

uploadImages();