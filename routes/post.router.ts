import express from 'express';
import PostController from '../controllers/post.ctrl';
import authenticateToken from '../utils/authenticateToken';

const router = express.Router();

router.post('/', authenticateToken, PostController.createPost);
router.patch('/:postId', authenticateToken, PostController.setPost);
router.delete('/:postId', authenticateToken, PostController.deletePost);
router.patch('/restore/:postId', authenticateToken, PostController.restorePost);

export default router;