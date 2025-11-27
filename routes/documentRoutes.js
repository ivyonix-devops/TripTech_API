import { Router } from 'express';
import { listDocuments, getDocumentById, uploadDocument, deleteDocument, getDocumentsByType, getDocumentsByEntity, upload } from '../controllers/documentController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listDocuments);
router.get('/type/:type', auth, getDocumentsByType);
router.get('/entity/:entityId', auth, getDocumentsByEntity);
router.get('/:id', auth, getDocumentById);
router.post('/', auth, upload.single('file'), uploadDocument);
router.delete('/:id', auth, deleteDocument);

export default router;
