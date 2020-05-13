const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router.route('/register').post(register);
router.route('/login').post(login);
module.exports = router;
