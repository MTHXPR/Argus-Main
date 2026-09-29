const express = require('express');

const {
    listarMaquinas,
    cadastrarMaquina,
    atualizarMaquina,
    excluirMaquina
} = require('../controllers/maquinaController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', autenticar, listarMaquinas);
router.post('/', autenticar, cadastrarMaquina);
router.put('/:id', autenticar, atualizarMaquina);
router.delete('/:id', autenticar, excluirMaquina);

module.exports = router;