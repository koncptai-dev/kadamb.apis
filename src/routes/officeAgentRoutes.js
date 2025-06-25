const express = require('express');
const router = express.Router();
const OfficeAgentController = require('../controllers/officeAgentController');
const {validateOfficeAgentSignup}=require('../middlewares/validation');
const { validationResult } = require('express-validator');
// const authenticateToken =  require('../middlewares/auth');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach(err => {
      formattedErrors[err.param] = err.msg;
    });

    return res.status(400).json({ errors: formattedErrors });
  }

  next();}
router.post('/register',validateOfficeAgentSignup,handleValidation, OfficeAgentController.createOfficeAgent);
router.get('/all-agents', OfficeAgentController.getAgents);
router.post('/login', OfficeAgentController.loginofficeAgent);
router.put('/edit/:id', OfficeAgentController.updateOfficeAgent);

module.exports = router;
