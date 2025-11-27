import { Router } from 'express';
import { 
    listOperationsTeam, 
    addOperationsMember, 
    updateOperationsMember, 
    deleteOperationsMember, 
    updateOperationsMemberStatus,
    listOwnerOperationsTeam,
    addOwnerOperationsMember,
    updateOwnerOperationsMember,
    deleteOwnerOperationsMember
} from '../controllers/operationsController.js';
import auth from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', auth, listOperationsTeam);
router.post('/', auth, addOperationsMember);
router.put('/:id', auth, updateOperationsMember);
router.delete('/:id', auth, deleteOperationsMember);
router.patch('/:id/status', auth, updateOperationsMemberStatus);

router.get('/owner-operations', auth, listOwnerOperationsTeam);
router.post('/owner-operations', auth, addOwnerOperationsMember);
router.put('/owner-operations/:id', auth, updateOwnerOperationsMember);
router.delete('/owner-operations/:id', auth, deleteOwnerOperationsMember);

export default router;