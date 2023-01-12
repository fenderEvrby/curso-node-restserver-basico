const { Router } = require('express');
const { check } = require('express-validator');

const { validarCampos } = require('../middlewares/validar-campos');
const { esRoleValido, emailExiste, existeUsuarioPorId } = require('../helpers/db-validators');

const { usuariosGet, usuariosPost, usuariosPut, usuariosDelete, usuariosPatch } = require('../controllers/usuarios');
const router = Router();

router.get('/', usuariosGet );

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe ser de más de 6 letreas').isLength({ min: 6}),
    check('correo', 'Correo no válido').isEmail(),
    //check('rol', 'No es un rol válido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('rol').custom(esRoleValido),
    check('correo').custom(emailExiste),
    validarCampos
] ,usuariosPost);

router.put('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    check('rol').custom(esRoleValido),
    validarCampos
],
usuariosPut);

router.delete('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos
], usuariosDelete);

router.patch('/', usuariosPatch);

module.exports = router;