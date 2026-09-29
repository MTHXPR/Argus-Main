const express = require('express');

const {
    cadastrar,
    login,
    perfil
} = require('../controllers/authController');

const autenticar = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', cadastrar);
router.post('/login', login);

router.get('/me', autenticar, perfil);

router.get('/teste-protegido', autenticar, (req, res) => {
    res.json({
        message: 'Você está autenticado.',
        usuario: req.usuario
    });
});

module.exports = router;