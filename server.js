const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000; // important for Render!

// Serve static files (HTML, CSS, JS) from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Create the 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configure Multer for file storage and validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb('Error: Only JPEG, JPG, PNG, and PDF files are allowed!');
        }
    }
});

// Serve the homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', (req, res) => {
    upload.single('uploaded_file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).send(`Multer Error: ${err.message}`);
        } else if (err) {
            return res.status(400).send(`Upload Error: ${err}`);
        }
        if (!req.file) {
            return res.status(400).send('No file selected!');
        }
        res.send(`File uploaded successfully: ${req.file.originalname}`);
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
