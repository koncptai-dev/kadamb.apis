const express = require('express');
const router = express.Router();
const OfficeAgentController = require('../controllers/officeAgentController');
// const authenticateToken =  require('../middlewares/auth');

router.post('/register', OfficeAgentController.createOfficeAgent);
router.get('/all-agents', OfficeAgentController.getAgents);
router.post('/login', OfficeAgentController.loginofficeAgent);


module.exports = router;
