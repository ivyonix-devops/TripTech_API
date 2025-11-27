import { Router } from 'express';
import { listServices, getServiceById, createService, updateService, deleteService, updateServiceStatus } from '../controllers/serviceController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listServices);
router.get('/:id', auth, getServiceById);
router.post('/', auth, createService);
router.put('/:id', auth, updateService);
router.patch('/:id/status', auth, updateServiceStatus);
router.delete('/:id', auth, deleteService);

export default router;
