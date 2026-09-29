const express = require('express');

const {
    listarConfiguracoes,
    salvarConfiguracao
} = require('../controllers/configuracaoController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, listarConfiguracoes);

router.post('/', autenticar, salvarConfiguracao);

module.exports = router;
