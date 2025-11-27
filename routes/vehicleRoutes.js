import { Router } from 'express';
import { listVehicles, getVehiclesByStatus, createVehicle, updateVehicle, updateVehicleStatus, deleteVehicle, getVehicleById } from '../controllers/vehicleController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listVehicles);
router.get('/status/:status', auth, getVehiclesByStatus);
router.get('/:id', auth, getVehicleById);
router.post('/', auth, createVehicle);
router.put('/:id', auth, updateVehicle);
router.patch('/:id/status', auth, updateVehicleStatus);
router.delete('/:id', auth, deleteVehicle);

export default router;
