import { Router } from 'express';
import { getProtectedData } from '../controllers/protectedController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, getProtectedData);

export default router;
