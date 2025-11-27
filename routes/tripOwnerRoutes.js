import { Router } from 'express';
import { listOwners, getOwnerById, createOwner, updateOwner, updateOwnerStatus, deleteOwner } from '../controllers/tripOwnerController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listOwners);
router.get('/:id', auth, getOwnerById);
router.post('/', auth, createOwner);
router.put('/:id', auth, updateOwner);
router.patch('/:id/status', auth, updateOwnerStatus);
router.delete('/:id', auth, deleteOwner);

export default router;
