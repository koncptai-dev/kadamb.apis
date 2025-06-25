const { check } = require('express-validator');

exports.validateSignup = [
  check('first_name').trim().notEmpty().withMessage('First name is required'),
  check('last_name').trim().notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('address').trim().notEmpty().withMessage('Address is required'),
  check('mobileNo')
    .isNumeric().withMessage('Mobile number must be numeric')
    .isLength({  min:10,max: 10 }).withMessage('Mobile number should be  10 digits'),
];

exports.validateLogin = [
  check('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  check('password').notEmpty().withMessage('Password is required'),
];

exports.validateOfficeAgentSignup = [
  check('fullName').trim().notEmpty().withMessage('Full name is required'),
  check('mobileNo')
    .trim().notEmpty().withMessage('Mobile number is required')
    .isNumeric().withMessage('Mobile number must be numeric')
    .isLength({min:10, max:10 }).withMessage('Mobile number should be 10 digits'),
  check('email')
  .trim().notEmpty().withMessage('Email is required')
  .isEmail().withMessage('Invalid email').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];