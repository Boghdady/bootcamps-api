const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, updateUser, deleteUser, createUser } = require('../controllers/userController');

const router = express.Router();

/// Apply In all routes
router.use(protect, authorize('admin'));

router.route('/').get(getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
