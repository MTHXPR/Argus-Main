const express = require('express');

const {
    obterDashboard
} = require('../controllers/dashboardController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, obterDashboard);

module.exports = router;