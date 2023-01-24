const path = require('path');
const fs = require('fs');

const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL);

const { response } = require("express");
const { subirArchivo } = require("../helpers");

const { Usuario, Producto } = require('../models');

const cargarArchivo = async(req, res = response) =>{
    try {
        //Imagenes
        //const nombre = await subirArchivo(req.files);
        //const nombre = await subirArchivo(req.files, ['txt', 'pdf']);
        const nombre = await subirArchivo(req.files, ['txt', 'pdf'], 'textos');
        res.json({ nombre });
    } catch (error) {
        res.status(400).json({error});
    }
}

const actualizarImagen = async (req, res = response) =>{
    const {id, coleccion} = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                });
            }
            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }
            break;            
    
        default:
            return res.status(500).json({msg: 'No se validó esto'});
    }

    //Limpiar imagenes previas
    if(modelo.img){
        //Borrar la imagen del servidor
        //const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if(fs.existsSync(modelo.img)){
            fs.unlinkSync(modelo.img);
        }
    }
    
    const nombre = await subirArchivo(req.files, undefined, coleccion);
    modelo.img = nombre;

    await modelo.save();

    res.json(modelo);
}

const actualizarImagenCloudinary = async (req, res = response) =>{
    const {id, coleccion} = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                });
            }
            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }
            break;            
    
        default:
            return res.status(500).json({msg: 'No se validó esto'});
    }

    //Limpiar imagenes previas
    if(modelo.img){
        const nombreArr = modelo.img.split('/');
        const nombre = nombreArr[nombreArr.length -1];
        const [public_id] = nombre.split('.');
        cloudinary.uploader.destroy(public_id);
    }
    
    const { tempFilePath } = req.files.archivo;
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath);

    modelo.img = secure_url;
    await modelo.save();

    res.json(modelo);
}

const mostrarImagen = async (req, res = response) => {
    const {id, coleccion} = req.params;

    let modelo;

    switch (coleccion) {
        case 'usuarios':
            modelo = await Usuario.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un usuario con el id ${ id }`
                });
            }
            break;

        case 'productos':
            modelo = await Producto.findById(id);
            if(!modelo){
                return res.status(400).json({
                    msg: `No existe un producto con el id ${ id }`
                });
            }
            break;            
    
        default:
            return res.status(500).json({msg: 'No se validó esto'});
    }

    //Limpiar imagenes previas
    if(modelo.img){
        //Borrar la imagen del servidor
        //const pathImagen = path.join(__dirname, '../uploads', coleccion, modelo.img);
        if(fs.existsSync(modelo.img)){
            return res.sendFile(modelo.img);
        }
    }
    const pathImagen = path.join(__dirname, '../assets/no-image.jpg');
    return res.sendFile(pathImagen);
}

module.exports = {
    cargarArchivo,
    actualizarImagen,
    mostrarImagen,
    actualizarImagenCloudinary
}