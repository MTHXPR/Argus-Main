const express = require('express');

const { buscarPerfil } = require('../controllers/perfilController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, buscarPerfil);

module.exports = router;