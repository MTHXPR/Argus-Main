const express = require('express');

const { listarRelatorios } = require('../controllers/relatorioController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, listarRelatorios);

module.exports = router;