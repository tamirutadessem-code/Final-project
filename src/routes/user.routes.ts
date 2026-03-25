import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/', requireAdmin, userController.getAllUsers);
router.get('/:id', requireAdmin, userController.getUserById);
router.put('/:id', requireAdmin, userController.updateUser);
router.delete('/:id', requireAdmin, userController.deleteUser);
router.post('/change-password', userController.changePassword);

export default router;