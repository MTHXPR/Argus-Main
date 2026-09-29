const express = require('express');

const {
    listarPlanosMensais,
    listarPlanosAnuais
} = require('../controllers/planoController');

const router = express.Router();

router.get('/mensais', listarPlanosMensais);
router.get('/anuais', listarPlanosAnuais);

module.exports = router;