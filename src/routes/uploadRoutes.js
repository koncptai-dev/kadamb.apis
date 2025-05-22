const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/upload'); // Multer middleware
const authenticateToken = require('../middlewares/auth'); // JWT Auth middleware

// Upload a new document
router.post('/upload-agent-document', authenticateToken, upload.single('file'), uploadController.uploadAgentDocument);

// Get all uploaded documents for an agent
router.get('/agent-documents', authenticateToken, uploadController.getAgentDocuments);

// Edit an uploaded document (update file)
router.put('/edit-document/:id', authenticateToken, upload.single('file'), uploadController.editAgentDocument);

// Delete an uploaded document
router.delete('/delete-document/:id', authenticateToken, uploadController.deleteAgentDocument);

module.exports = router;
