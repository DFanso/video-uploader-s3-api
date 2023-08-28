const express = require('express');
const multer = require('multer');
const app = express();
const port = process.env.PORT || 3001;
const AWS = require('aws-sdk');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

app.use(cors());
app.use(express.json());

AWS.config.update({
  accessKeyId: process.env.Vultr_ACCESS_KEY_ID,
  secretAccessKey: process.env.Vultr_SECRET_ACCESS_KEY,
  region: process.env.Vultr_REGION,
  endpoint: process.env.Vultr_ENDPOINT,
});


const s3 = new AWS.S3();

const upload = multer().single('video');


const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

server.timeout = 900000; 

app.post('/upload', upload, (req, res) => {
  const videoFile = req.file;
  if (!videoFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Replace spaces in the file name with underscores
  const cleanedFileName = videoFile.originalname.replace(/\s+/g, '_');

  const params = {
    Bucket: 'fee999',
    Key: cleanedFileName, // Use the cleaned file name
    Body: videoFile.buffer,
    ACL: 'public-read',
    ContentType: videoFile.mimetype,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error(`Upload failed for ${cleanedFileName}:`, err);
      return res.status(500).json({ error: 'Upload failed' });
    }
  
    const s3BucketUrl = `https://${params.Bucket}.${process.env.Vultr_ENDPOINT}`;
    const videoKey = cleanedFileName;
  
    const videoUrl = `${s3BucketUrl}/${videoKey}`;
  
    console.log(`Video ${cleanedFileName} uploaded successfully:`, videoUrl);
    return res.status(200).json({ uploadedUrl: videoUrl });
  });
});


