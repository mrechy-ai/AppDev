const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Create the 'uploads' directory if it doesn't exist
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for file storage and validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Set the destination folder
    },
    filename: (req, file, cb) => {
        // Use the original file name
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
        // Validate file types
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true); // Accept the file
        } else {
            cb('Error: Only JPEG, JPG, PNG, and PDF files are allowed!'); // Reject the file
        }
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle file upload POST request
app.post('/upload', (req, res, next) => {
    upload.single('uploaded_file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(`Multer Error: ${err.message}`);
        } else if (err) {
            return res.status(400).send(`Upload Error: ${err}`);
        }
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).send('No file selected!');
        }
        res.send(`File uploaded successfully: ${req.file.originalname}`);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});