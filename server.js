// server.js
const fs = require('fs');
const vision = require('@google-cloud/vision');

// 1. Google Vision Client eka setup karanna (Key file path eka denna)
const client = new vision.ImageAnnotatorClient({
  keyFilename: './api-key.json' // Path to your Google Cloud API key
});

// 2. Logic to Scan Image using Cloud Vision
async function scanPrescription(imagePath) {
  try {
    console.log("Scanning prescription...");

    // Read the local image file
    const fileBuffer = fs.readFileSync(imagePath);
    const request = {
      image: { content: fileBuffer },
    };

    // Performs text detection on the image file
    const [result] = await client.textDetection(request);
    const detections = result.textAnnotations;

    if (detections.length === 0) {
      return "No text detected in the image.";
    }

    const detectedText = detections[0].description;
    console.log("Detected Text:", detectedText);

    // --- YOUR LOGIC HERE ---
    // Oyaata thiyena text eka moken hari split karala (e.g., regex)
    // beheth nama hoyaganna puluwan. Example response:
    return processText(detectedText); 

  } catch (err) {
    console.error('ERROR during scan:', err);
    return "Failed to scan the image.";
  }
}



// Test function - How to call it locally (Uncomment to test)
// scanPrescription('./test-prescription.jpg'); 

module.exports = { scanPrescription };
const vision = require('@google-cloud/vision');
const translate = require('@google-cloud/translate').v2; // සිංහලට පරිවර්තනය සඳහා

const client = new vision.ImageAnnotatorClient({
  keyFilename: './api-key.json' // ඔබ බාගත කළ JSON Key එකේ නම
});

const translateClient = new translate.Translate({
  keyFilename: './api-key.json' 
});

async function scanWithGoogleVision(imagePath) {
  try {
    // 1. Image එකෙන් Text හඳුනා ගැනීම (OCR)
    const [result] = await client.textDetection(imagePath);
    const fullText = result.fullTextAnnotation ? result.fullTextAnnotation.text : "No text found";

    // 2. සිංහලට පරිවර්තනය කිරීම
    let [sinhalaText] = await translateClient.translate(fullText, 'si');

    return {
      english: fullText,
      sinhala: sinhalaText
    };
  } catch (err) {
    console.error('Vision API Error:', err);
    return null;
  }
}
