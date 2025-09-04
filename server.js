const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create the 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
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
    fileFilter: (req, file, cb) => {
        // Define allowed file types
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            // Reject file and provide a specific error message
            cb('Error: Only JPEG, JPG, PNG, and PDF files are allowed!');
        }
    }
});

// Serve the homepage from the 'public' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', (req, res) => {
    upload.single('uploaded_file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Handle Multer's specific errors
            return res.status(400).send(`Multer Error: ${err.message}`);
        } else if (err) {
            // Handle other custom errors from the fileFilter function
            return res.status(400).send(`Upload Error: ${err}`);
        }
        
        // Check if a file was actually uploaded
        if (!req.file) {
            return res.status(400).send('No file selected!');
        }
        
        // Success response
        res.status(200).send(`File "${req.file.originalname}" uploaded successfully!`);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
