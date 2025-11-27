import { Router } from 'express';
import { sendInvite, sendInviteToLc, listInvites, getInviteById, acceptInvite, rejectInvite, deleteInvite } from '../controllers/invitationController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.post('/send', auth, sendInvite);
router.post('/send-to-lc', auth, sendInviteToLc);
router.get('/', auth, listInvites);
router.get('/:invitation_id', auth, getInviteById);
router.put('/:invitation_id/accept', auth, acceptInvite);
router.put('/:invitation_id/reject', auth, rejectInvite);
router.delete('/:invitation_id', auth, deleteInvite);

export default router;
