import express from 'express';
import UserController from '../controllers/user.ctrl';

const router = express.Router();

router.post('/join', UserController.join);
router.post('/login', UserController.login);

export default router;