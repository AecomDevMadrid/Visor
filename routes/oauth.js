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

const express = require('express');

const config = require('../config');
const { OAuth } = require('./common/oauth');
//console.log(config.credentials.CLIENT_ID);
let router = express.Router();
router.get('/test',async (req,res,next)=>{
    console.log("eee");
    res.send('ruta de prueba');
})
router.get('/api/Oauth', async (req, res, next) => {
    const { code } = req.query;
    const oauth = new OAuth(req.session);
    try {
        await oauth.setCode(code);
        res.redirect('/');
    } catch(err) {
        next(err);
    }
});

router.get('/oauth/url', (req, res) => {
    const url =
        'https://developer.api.autodesk.com' +
        '/authentication/v1/authorize?response_type=code' +
        '&client_id=' + config.credentials.CLIENT_ID +
        '&redirect_uri=' + config.credentials.callback_url +
        '&scope=' + config.scopes.internal.join(' ');
    res.end(url);
});

router.get('/oauth/signout', (req, res) => {
    req.session = null;
   // res.redirect('/');
    //res.location('./NoAutorizado.html');
    //res.send("<h1 style='color: red; margin-top: 20%; font-size: 50px;'> USUARIO NO AUTORIZADO </h1>");
    res.send(" <head><script src='//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/js/bootstrap.min.js'></script><link rel='stylesheet' href='//cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.min.css'></head></script><div class='container'><div class='jumbotron text-center'> <h1>USUARIO NO AUTORIZADO</h1> <p class='lead'>Póngase en contacto con el administrador de la aplicación</p> <p><a class='btn btn-lg btn-success' href='https://visoractivos.herokuapp.com/' role='button'>Home</a></p> </div></div>")
   //document.getElementById('visor').html("USUARIO NO AUTORIZADO");
});

// Endpoint to return a 2-legged access token
router.get('/oauth/token', async (req, res, next) => {
    const oauth = new OAuth(req.session);
    if (!oauth.isAuthorized()) {
        res.status(401).end();
        return;
    }

    try {
        const accessToken = await oauth.getPublicToken();
        res.json(accessToken);
    } catch(err) {
        next(err);
    }
});

module.exports = router;
