const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const uploadController = require('../controllers/uploadController');
const adminController = require('../controllers/adminController');

const auth = require('../middleware/auth');

// User Auth
router.post('/login', authController.login);
router.post('/updateUser', auth.authenticateToken, authController.updateUser);

// Upload
router.post('/upload', auth.authenticateToken, uploadController.upload);

// Posts (Public)
router.get('/posts', postController.getPosts);
router.get('/posts/:id', postController.getPostDetail);
router.get('/categories', postController.getCategories);

// Posts (Protected)
router.post('/posts', auth.authenticateToken, postController.createPost);
router.post('/posts/like', auth.authenticateToken, postController.likePost);
router.post('/posts/comment', auth.authenticateToken, postController.commentPost);

// My
router.get('/my/posts', auth.authenticateToken, postController.getMyPosts);

// Admin
router.post('/admin/login', adminController.login);
router.get('/admin/posts', auth.authenticateToken, auth.authorizeAdmin, adminController.getPosts);
router.post('/admin/posts/audit', auth.authenticateToken, auth.authorizeAdmin, adminController.auditPost);
router.get('/admin/stats', auth.authenticateToken, auth.authorizeAdmin, adminController.getStats);

module.exports = router;
