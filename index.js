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
    endpoint: process.env.Vultr_ENDPOINT ,

});

  

const s3 = new AWS.S3();

const upload = multer();

app.post('/upload', upload.any(), (req, res) => {
    const videoFiles = req.files;
    const uploadedVideoUrls = []; // To store the URLs of successfully uploaded videos

    if (videoFiles.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

  // Loop through the array of files and upload each one to S3
  videoFiles.forEach((videoFile) => {
    const params = {
      Bucket: 'fee99',
      Key: videoFile.originalname,
      Body: videoFile.buffer,
      ACL: 'public-read',
      ContentType: videoFile.mimetype,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error(`Upload failed for ${videoFile.originalname}:`, err);
      } else {
        const videoUrl = data.Location;
        console.log(`Video ${videoFile.originalname} uploaded successfully:`, videoUrl);
        uploadedVideoUrls.push(videoUrl);
      }

      // Check if all files have been processed
      if (uploadedVideoUrls.length === videoFiles.length) {
        return res.status(200).json({ uploadedUrls: uploadedVideoUrls });
      }
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
