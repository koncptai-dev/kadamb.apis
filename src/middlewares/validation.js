const { check } = require('express-validator');

exports.validateSignup = [
  check('first_name').trim().notEmpty().withMessage('First name is required'),
  check('last_name').trim().notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('role').isIn(['admin', 'agent', 'user']).withMessage('Invalid role'),
  check('address').trim().notEmpty().withMessage('Address is required'),
  check('mobile_no')
    .isNumeric().withMessage('Mobile number must be numeric')
    .isLength({ min: 10, max: 15 }).withMessage('Mobile number should be between 10-15 digits'),
];

exports.validateLogin = [
  check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  check('password').notEmpty().withMessage('Password is required'),
];
