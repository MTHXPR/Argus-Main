const express = require('express');

const {
    listarAtividades
} = require('../controllers/atividadeController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, listarAtividades);

module.exports = router;