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

$(document).ready(function () {
  // first, check if current visitor is signed in
  jQuery.ajax({
    url: '/api/forge/oauth/token',
    success: function (res) {
      // yes, it is signed in...
     
      $('#signOut').show();
      $('#refreshHubs').show();

      // prepare sign out
      $('#signOut').click(function () {
        $('#hiddenFrame').on('load', function (event) {
          location.href = '/api/forge/oauth/signout';
        });
        $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
        // learn more about this signout iframe at
        // https://forge.autodesk.com/blog/log-out-forge
      })

      // and refresh button
      $('#refreshHubs').click(function () {
        $('#userHubs').jstree(true).refresh();
      });

      // finally:
     
      CheckUser();
    
    }
  });

  $('#autodeskSigninButton').click(function () {
    
    jQuery.ajax({
      url: '/api/forge/oauth/url',
      success: function (url) {
        location.href = url;
      }
    });
  })
});

function prepareUserHubsTree() {
  $('#userHubs')

  .jstree({
    'core': {
      'themes': { "icons": true },
      'multiple': false,
      'data': {
        "url": '/api/forge/datamanagement',
        "dataType": "json",
        'cache': false,
        'data': function (node) {
          $('#userHubs').jstree(true).toggle_node(node);
          return { "id": node.id };
        }
      }
    },
    'types': {
      'default': { 'icon': 'glyphicon glyphicon-question-sign' },
      '#': { 'icon': 'glyphicon glyphicon-user' },
      'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
      'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
      'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
      'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },      
      'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
      'items': { 'icon': 'glyphicon glyphicon-file' },
      'bim360documents': { 'icon': 'glyphicon glyphicon-file' },
      'versions': { 'icon': 'glyphicon glyphicon-time' },
      'unsupported': { 'icon': 'glyphicon glyphicon-ban-circle' }
    },
    "sort": function (a, b) {
      var a1 = this.get_node(a);
      var b1 = this.get_node(b);
      var parent = this.get_node(a1.parent);
      if (parent.type === 'items') { // sort by version number
        var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')))
        var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')));
        return id1 > id2 ? 1 : -1;
      }
      else if (a1.type !== b1.type) return a1.icon < b1.icon ? 1 : -1; // types are different inside folder, so sort by icon (files/folders)
      else return a1.text > b1.text ? 1 : -1; // basic name/text sort
    },
    "plugins": ["types", "state", "sort","Wholerow"],
    "state": { "key": "autodeskHubs" }// key restore tree state
  })
  .bind("activate_node.jstree", function (evt, data) {

    if (data != null && data.node != null && (data.node.type == 'versions' || data.node.type == 'bim360documents')) {
      // in case the node.id contains a | then split into URN & viewableId
      if (data.node.id.indexOf('|') > -1) {
        var urn = data.node.id.split('|')[1];
        var viewableId = data.node.id.split('|')[2];
        console.log("click_1");
        launchViewer(urn, viewableId);
      }
      else {
        console.log("Añadido un modelo a federar");
        //Carga el modelo
        //en data.node.original esta todo la info que he guardao en el nodo
        console.log(data.node.original);
        let nm=document.getElementById(data.node.parent);
        
        let nombreModelo=(nm.childNodes[1].childNodes[1].data).trim();
        //en tipo he incluido la extension del archivo para poder gestionar si se carga o no y donde
       // console.log(data.node.original.tipo);
        let listaModelos=document.getElementById("modelosFederar");
        
        let linea = document.createElement("li");
        
        linea.classList.add("list-group-item");
        linea.id=nombreModelo;//id de la linea=nombre del modelo para facilitar su localizacion despues
        //<span class="badge badge-primary badge-pill">14</span>
        let boton=document.createElement("button");
        boton.className=("btn btn-default");
        
        //boton.appendChild(document.createTextNode("BORRAR"));
        let icono=document.createElement("span");
        //icono.appendChild(document.createTextNode("1"));
        icono.className=("glyphicon glyphicon-trash");
        //icono.ariaHidden="true";
        
        boton.appendChild(icono);
        linea.appendChild(boton);
        linea.appendChild(document.createTextNode(nombreModelo));
        //No consigo añadir el evento al boton, como esta creado dimanicamente, pasa algo, y hay un tema de padres e hijos, ademas se mete por medio el icono tambien...
        //el boton y el icono no tienen id, entonces busco el padre del target y saco su id, que es el nombre del modelo además,
        linea.addEventListener("click",function(e){
          console.log(e)
          console.log(e.target.id)
          if(e.target.id===""){
            EliminarSeleccionado(e.target.offsetParent.id)
          }
        })
        if (isModel(data.node.original.tipo,data.node.original.versionID)){
        //boton.addEventListener("click",function(){EliminarSeleccionado(linea.innerText)}, false)
        listaModelos.appendChild(linea);//los modelos a federar
        console.log("No es un xlsx, se evalua como modelo...")
        //console.log(data.node);
        getModels(data.node.id,linea.innerText);
        }else{
          console.log("Era un XLSX!!!")
        }
        
        //no deberia poder añadirse si no es un modelo....
        //isModel(data.node.original.tipo)
        //launchViewer(data.node.id);
      }
    }
  })
  .bind("move_node.jstree", function(e, data) {
    console.log("Drop node ");
        });



}


function showUser() {
  
  jQuery.ajax({
    url: '/api/forge/user/profile',
    success: function (profile) {
      var img = '<img src="' + profile.picture + '" height="30px">';
      $('#userInfo').html(img + profile.name);
      
    }
  });
}
//muy burdo, si el usuario no esta en la lista le hago un sing out...
function CheckUser() {
  console.log("checkUser");
  jQuery.ajax({
    url: '/api/forge/user/profileCheck',
    success: function (profile) {
  console.log("comprobacion usuario");
  if (profile.autorizado){
   //el correo del usuario esta en la lista de autorizados
    prepareUserHubsTree();
    showUser();
    
  }else{
    console.log("CheckUser NO autorizado");
    //El correo no esta en la lista de usuarios autorizados
    location.href = '/api/forge/oauth/signout'; 
  }  
    }
  });
}

function isModel(nd,id){
          console.log(nd);
          console.log(id);
          let project_id='b.99a67f48-dc5a-4524-bf43-4ea4a696ba69'
          if(nd==="xlsx"){
           //ESTO NO FUNCIONA!!!!
            console.log("es un excel");
            //llamo a una ruta del servidor y desde alli consulto la base de datos
            jQuery.ajax({
              url: '/api/forge/getExcel',
              data: { 
                project_id:project_id,
                version_id: id
                },
              success: function (res) {
                //la respuesta es el workbook
                //console.log(res);
                procesaExcel(res)
              }
            });
            
            return false
          }else{
            return true
          }
}

