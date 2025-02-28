import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getAllUsers, searchUsers } from '../controllers/user.controller.js';

const router = express.Router();

// Get all users except current user
router.get('/all', protect, getAllUsers);

// Search users by username or name
router.get('/search', protect, searchUsers);

export default router;