const express = require('express');

const { buscarAssinatura } = require('../controllers/assinaturaController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, buscarAssinatura);

module.exports = router;