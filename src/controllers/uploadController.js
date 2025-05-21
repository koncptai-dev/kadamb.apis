const path = require('path');
const Upload = require('../models/Upload'); // Import Upload model
const Agent = require('../models/Agent'); // Import Agent model
const fs = require('fs');

exports.uploadAgentDocument = async (req, res) => {
    const fieldType = req.query.field; // Get the field type from query parameters

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const allowedFields = ['addressProof', 'identityProof', 'photo', 'signature'];
    if (!allowedFields.includes(fieldType)) {
        return res.status(400).json({ message: 'Invalid field type' });
    }

    try {
        // **Extract agentId from JWT token**
        const agentId = req.user.id; // Ensure JWT payload contains the agent ID
        console.log("Agent ID from token:", agentId); // Debugging step

        if (!agentId) {
            return res.status(401).json({ message: 'Unauthorized: Agent ID missing' });
        }

        // **Check if agent exists**
        const agent = await Agent.findByPk(agentId);
        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        // **Save file information in Upload table**
        const newUpload = await Upload.create({
            agentId: agentId,
            fieldType: fieldType,
            filePath: `/uploads/properties/${req.file.filename}`
        });

        console.log('File saved:', newUpload);

        res.status(201).json({
            message: `${fieldType} uploaded successfully`,
            filePath: newUpload.filePath,
            uploadData: newUpload
        });

    } catch (error) {
        console.error('Database Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



// ✅ **Get all uploaded documents for an agent**
exports.getAgentDocuments = async (req, res) => {
    try {
        const agentId = req.user.id; // Extract agent ID from token
        const documents = await Upload.findAll({ where: { agentId } });

        res.status(200).json({ message: "Documents retrieved successfully", documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ✅ **Edit (Update) an uploaded document**
exports.editAgentDocument = async (req, res) => {
    const documentId = req.params.id;

    if (!req.file) {
        return res.status(400).json({ message: 'No new file uploaded' });
    }

    try {
        const document = await Upload.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.agentId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You can only edit your own documents' });
        }

        // Delete the old file
        const oldFilePath = path.join(__dirname, '..', 'uploads', 'properties', path.basename(document.filePath));
        if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
        }

        // Update with new file path
        document.filePath = `/uploads/properties/${req.file.filename}`;
        await document.save();

        res.status(200).json({ message: 'Document updated successfully', updatedDocument: document });
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ✅ **Delete an uploaded document**
exports.deleteAgentDocument = async (req, res) => {
    const documentId = req.params.id;

    try {
        const document = await Upload.findByPk(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.agentId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized: You can only delete your own documents' });
        }

        // Delete the file from storage
        const filePath = path.join(__dirname, '..', 'uploads', 'properties', path.basename(document.filePath));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the database record
        await document.destroy();

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};