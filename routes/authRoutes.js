import { Router } from 'express';
import { register, login, getProfile, updateProfile, logout, verifyEmail, changePassword } from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/verify-email', verifyEmail);
router.post('/change-password', auth, changePassword);


export default router;