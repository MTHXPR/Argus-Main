const express = require('express');

const { listarAlertas } = require('../controllers/alertaController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, listarAlertas);

module.exports = router;