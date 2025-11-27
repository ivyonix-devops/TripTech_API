import { Router } from 'express';
import { listVendors, getVendorById, createVendor, updateVendor, updateVendorStatus, deleteVendor } from '../controllers/vendorController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listVendors);
router.get('/:id', auth, getVendorById);
router.post('/', auth, createVendor);
router.put('/:id', auth, updateVendor);
router.patch('/:id/status', auth, updateVendorStatus);
router.delete('/:id', auth, deleteVendor);

export default router;
