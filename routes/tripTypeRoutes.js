import { Router } from 'express';
import { createTripType, getAllTripTypes, getTripTypeById, updateTripType, deleteTripType } from '../controllers/tripTypeController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', auth, createTripType);
router.get('/', auth, getAllTripTypes);
router.get('/:id', auth, getTripTypeById);
router.put('/:id', auth, updateTripType);
router.delete('/:id', auth, deleteTripType);

export default router;
