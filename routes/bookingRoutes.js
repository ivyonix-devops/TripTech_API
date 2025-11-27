import { Router } from 'express';
import { listBookings, getBookingById, createBooking, updateBooking, deleteBooking, getBookingsByOwnerCompany } from '../controllers/bookingController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listBookings);
router.get('/owner/:company', auth, getBookingsByOwnerCompany);
router.get('/:id', auth, getBookingById);
router.post('/', auth, createBooking);
router.put('/:id', auth, updateBooking);
router.delete('/:id', auth, deleteBooking);

export default router;
