import pool from '../config/db.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const listDocuments = async (req, res) => {
    try {
        const [documents] = await pool.query('SELECT * FROM documents');
        res.json({ success: true, data: documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getDocumentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [documents] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
        if (documents.length === 0) {
            return res.status(404).json({ success: false, error: 'Document not found', statusCode: 404 });
        }
        res.json({ success: true, data: documents[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getDocumentsByType = async (req, res) => {
    const { type } = req.params;
    try {
        const [documents] = await pool.query('SELECT * FROM documents WHERE file_type = ?', [type]);
        res.json({ success: true, data: documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const getDocumentsByEntity = async (req, res) => {
    const { entityId } = req.params;
    try {
        const [documents] = await pool.query('SELECT * FROM documents WHERE entity_id = ?', [entityId]);
        res.json({ success: true, data: documents });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


const uploadDocument = async (req, res) => {
    const { entity_type, entity_id } = req.body;
    const { filename, path, size, mimetype } = req.file;

    try {
        const [result] = await pool.query(
            'INSERT INTO documents (file_name, file_path, file_size, file_type, entity_type, entity_id) VALUES (?, ?, ?, ?, ?, ?)',
            [filename, path, size, mimetype, entity_type, entity_id]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, filename, path }, message: 'Document uploaded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};

const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        // Also delete the file from the filesystem
        const [documents] = await pool.query('SELECT file_path FROM documents WHERE id = ?', [id]);
        if (documents.length > 0) {
            const fs = await import('fs/promises');
            await fs.unlink(documents[0].file_path);
        }
        await pool.query('DELETE FROM documents WHERE id = ?', [id]);
        res.json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Server error', statusCode: 500 });
    }
};


export { listDocuments, getDocumentById, uploadDocument, deleteDocument, getDocumentsByType, getDocumentsByEntity, upload };
