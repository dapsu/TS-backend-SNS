import express from 'express';
import UserController from '../controllers/user.ctrl';
import authenticateToken from '../utils/authenticateToken';

const router = express.Router();

router.post('/join', UserController.join);
router.post('/login', UserController.login);
router.get('/logout', authenticateToken, UserController.logout);

export default router;