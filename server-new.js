const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// MIME types
const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.woff2': 'font/woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Create data directory and file if they don't exist
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'surplus.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf8');
}

// Routes
app.post('/api/surplus', upload.array('images', 5), (req, res) => {
    try {
        // Read existing data
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        
        // Handle file uploads
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagePaths.push(path.join('uploads', file.filename));
            });
        }
        
        // Create new surplus item
        const newItem = {
            id: Date.now().toString(),
            ...req.body,
            images: imagePaths,
            createdAt: new Date().toISOString()
        };
        
        // Add to data array and save
        data.push(newItem);
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
        
        res.status(201).json({ 
            success: true, 
            message: 'تم إضافة العنصر بنجاح',
            data: newItem
        });
    } catch (error) {
        console.error('Error saving surplus item:', error);
        res.status(500).json({ 
            success: false, 
            message: 'حدث خطأ أثناء حفظ البيانات',
            error: error.message 
        });
    }
});

// Get all surplus items
app.get('/api/surplus', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error fetching surplus items:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب البيانات',
            error: error.message
        });
    }
});

// Serve static files
app.get('*', (req, res) => {
    let pathname = path.join(__dirname, req.path);
    
    // Default to index.html if no file is specified
    if (pathname.endsWith('/') || !path.extname(pathname)) {
        pathname = path.join(pathname, 'index.html');
    }
    
    // Check if file exists
    fs.access(pathname, fs.constants.F_OK, (err) => {
        if (err) {
            // File not found, send 404
            res.status(404).send('الملف غير موجود');
            return;
        }
        
        // Get file extension and content type
        const extname = String(path.extname(pathname)).toLowerCase();
        const contentType = mimeTypes[extname] || 'application/octet-stream';
        
        // Read and send the file
        fs.readFile(pathname, (error, content) => {
            if (error) {
                res.writeHead(500);
                res.end('عذراً، حدث خطأ في الخادم: ' + error.code);
                return;
            }
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
    console.log('نموذج إضافة فائض: http://localhost:' + PORT + '/post-surplus.html');
});
