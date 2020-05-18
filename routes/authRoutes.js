const express = require('express');
const { protect } = require('../middleware/auth');
const {
	register,
	login,
	forgotPassword,
	resetPassword,
	getMe,
	updateMe,
	updatePassword
} = require('../controllers/authController');

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword/:resetToken').put(resetPassword);
router.route('/me').get(protect, getMe);
router.route('/updateMe').put(protect, updateMe);
router.route('/updatePassword').put(protect, updatePassword);

module.exports = router;
