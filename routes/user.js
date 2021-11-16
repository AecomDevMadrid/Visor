/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Forge Partner Development
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////
const express = require('express');
//const usu = require('../public/js/UsuariosAutorizados.js');
const config=require('../config');
const usuarios=config.users;
//const users=require('./UsuariosAutorizados');

const { UserProfileApi } = require('forge-apis');

const { OAuth } = require('./common/oauth');

let router = express.Router();

router.get('/user/profile', async (req, res) => {
    
    //console.log("user/profile");
    const oauth = new OAuth(req.session);
    const internalToken = await oauth.getInternalToken();
    const user = new UserProfileApi();
    const profile = await user.getUserProfile(oauth.getClient(), internalToken);
    
    res.json({
        name: profile.body.firstName + ' ' + profile.body.lastName,
        picture: profile.body.profileImages.sizeX40,
        email: profile.body.emailId

    });
});
router.get('/user/profileCheck', async (req, res) => {
    //para acceder a la aplicacion el usuario tiene que estar en una lista
    console.log("Esta el usuario autorizado para usar la aplicacion?");
    const oauth = new OAuth(req.session);
    const internalToken = await oauth.getInternalToken();
    const user = new UserProfileApi();
    let autorizado=false;
    const profile = await user.getUserProfile(oauth.getClient(), internalToken);
    //console.log("perfil:" +profile.body.emailId);
    //console.log(usuarios.split(","));
    //console.log(process.env.USERS);//asi no tengo acceso a la variable
    //si usuarios se guarda en una variable de entorno, lo hace como string, si quiero array tengo que transformarlo, pero parece que includes funciona sobre la string sin la transformacion
    if (usuarios.split(",").includes(profile.body.emailId)){
        console.log("Usuario autorizado");
    autorizado=true;
    }
    res.json({
        name: profile.body.firstName + ' ' + profile.body.lastName,
        picture: profile.body.profileImages.sizeX40,
        email: profile.body.emailId,
        autorizado: autorizado

    });
});
module.exports = router;
