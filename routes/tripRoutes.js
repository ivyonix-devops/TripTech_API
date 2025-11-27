import { Router } from 'express';
import { listTrips, getTripById, createTrip, updateTrip, updateTripStatus, addTripCost, getTripCosts, deleteTrip } from '../controllers/tripController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listTrips);
router.get('/:id', auth, getTripById);
router.post('/', auth, createTrip);
router.put('/:id', auth, updateTrip);
router.patch('/:id/status', auth, updateTripStatus);
router.post('/:id/costs', auth, addTripCost);
router.get('/:id/costs', auth, getTripCosts);
router.delete('/:id', auth, deleteTrip);

export default router;
