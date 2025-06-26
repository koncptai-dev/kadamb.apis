const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authenticateToken =  require('../middlewares/auth');
// const { validationResult } = require('express-validator');
// const { validateSignup, validateLogin } = require('../middlewares/validation');

// const handleValidation = (req, res, next) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     const formattedErrors = {};
//     errors.array().forEach(err => {
//       formattedErrors[err.param] = err.msg;
//     });
//     return res.status(400).json({ errors: formattedErrors });
//   }
//   next();
// };

router.post('/register', agentController.registerAgent);
router.post('/login', agentController.loginAgent);
router.put('/edit/:id', agentController.editAgent);
router.post('/change-password', authenticateToken, agentController.changePassword);
router.post('/forgot-password', agentController.sendResetCode);
router.post('/reset-password', agentController.resetPassword);
router.get('/profile', authenticateToken, agentController.getAgentProfile);
router.get('/all-agents', agentController.getAllAgents);

router.get('/:id/sub-agents',agentController.getAgentwithSubAgent);
router.get('/all-sub-agents', agentController.getAllSubAgents);
router.delete('/delete/:id', agentController.deleteAgent);


module.exports = router;
