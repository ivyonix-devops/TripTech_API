import { Router } from 'express';
import { listDrivers, getAvailableDrivers, createDriver, updateDriver, deleteDriver, getDriverById } from '../controllers/driverController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listDrivers);
router.get('/available', auth, getAvailableDrivers);
router.get('/:id', auth, getDriverById);
router.post('/', auth, createDriver);
router.put('/:id', auth, updateDriver);
router.delete('/:id', auth, deleteDriver);

export default router;
