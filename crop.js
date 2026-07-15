const sharp = require('sharp');
const fs = require('fs');

async function processImage() {
  const input = 'images.jpg';
  const meta = await sharp(input).metadata();
  console.log('Image size:', meta.width, 'x', meta.height);
  
  // Create hero image (let's assume it's in the middle left)
  // We'll just extract a chunk
  await sharp(input)
    .extract({ left: 30, top: 200, width: 120, height: 120 })
    .toFile('public/hero-dentist.jpg')
    .catch(console.error);

  // We'll also just copy the image entirely to public as fallback
  fs.copyFileSync(input, 'public/reference-design.jpg');
}

processImage();
