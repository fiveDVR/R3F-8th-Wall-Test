import { Jimp } from 'jimp';

async function processImage() {
  try {
    const image = await Jimp.read('isis-test.png');
    // Crop center 3:4 area (768x1024)
    image.crop({ x: 0, y: 176, w: 768, h: 1024 });
    
    // Resize the goddess graphic slightly smaller to fit inside the border
    image.resize({ w: 440, h: 586 });
    
    // Create a 480x640 black background canvas
    const background = new Jimp({ width: 480, height: 640, color: 0x000000ff });
    
    // Composite the cropped goddess image in the center of the black frame
    background.composite(image, 20, 27);
    
    // Write the final target image
    await background.write('public/targets/isis-tracker.jpg');
    console.log('Successfully generated bordered target at public/targets/isis-tracker.jpg');
  } catch (err) {
    console.error('Error processing image:', err);
  }
}

processImage();
