const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const authenticateToken =  require('../middlewares/auth');

router.post('/register',authenticateToken, agentController.registerAgent);
router.post('/login', agentController.loginAgent);
router.put('/edit/:id', authenticateToken,agentController.editAgent);
router.post('/change-password', authenticateToken, agentController.changePassword);
router.post('/forgot-password', agentController.sendResetCode);
router.post('/reset-password', agentController.resetPassword);
router.get('/profile', authenticateToken, agentController.getAgentProfile);
router.get('/all-agents', agentController.getAllAgents);

router.get('/:id/sub-agents',agentController.getAgentwithSubAgent);
router.get('/all-sub-agents', agentController.getAllSubAgents);
router.delete('/delete/:id', agentController.deleteAgent);


module.exports = router;
