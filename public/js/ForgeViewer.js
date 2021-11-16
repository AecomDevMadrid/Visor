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

let viewer;
const view = new Autodesk.Viewing.AggregatedView();
// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
const models = [];

//function launchViewer(urn, viewableId) {
  function launchViewer(model) {
  //chequear si ya esta cargado en el array y no permitir cosas que no sean modelos...
  //models.push({name:"aaaa",urn:'urn:'+urn})
  //console.log(urn);
  //console.log(models);
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken,
    extensions: ['SelectionChanged'],
    //api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : '') // handle BIM 360 US and EU regions
    api: 'derivativeV2'
  };
  const options3d = {
    viewerConfig: {
      disableBimWalkInfoIcon: true
    }
  };
 /*   Autodesk.Viewing.Initializer(options, () => {
    console.log("inicializando");
    const viewerDiv = document.getElementById( 'forgeViewer' );
   viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'));
   //viewer = new Autodesk.Viewing.AggregatedView(document.getElementById('forgeViewer'));
   //viewer = new Autodesk.Viewing.AggregatedView(document.getElementById('forgeViewer'));
    viewer.loadExtension('MyAwesomeExtension');
    viewer.loadExtension('MyAwesomeExtension2')
    viewer.refresh();
    viewer.start();

                
    var documentId = 'urn:' + urn;
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  }); */


  Autodesk.Viewing.Initializer( options, function() {
    //get the viewer div
    
    const viewerDiv = document.getElementById( 'forgeViewer' );

    //initialize the viewer object
    
    view.init( viewerDiv, options3d );
    //console.log(view)
    viewer = view.viewer;
 
    const tasks = [];

    model.forEach( md => tasks.push( loadManifest( md.urn ) ) );
    //CARGA DE EXTENSIONES DEFINIDAS MEDIANTE CLASES
  //viewer.loadExtension('XXXXXX');
  viewer.loadExtension('DrawBoundsToolExtension');//consulta de coordenadas
  viewer.loadExtension('selToActivosExtension').then(
    function(ext){
      //hasta que no se ha cargado la otra extension no puedo cargar esta pq necesito elgroupcontrol creado
      viewer.loadExtension('FuncionesExtension')//Funciones RIH
    },function(err){
      console.log(err)
    });
  
  
    
   //  viewer.loadExtension('FuncionesExtension')//Funciones RIH
  //extension que captura los cambios en la seleccion de elementos
   
 
    Promise.all(tasks)
            .then( docs =>  Promise.resolve( docs.map( doc => {
              const bubbles = doc.getRoot().search({type:'geometry', role: '3d'});
              const bubble = bubbles[0];
              if( !bubble ) return null;

              return bubble;
            })))
            .then( bubbles => view.setNodes( bubbles ) );
            
            
     viewer.fitToView()      
  }); 


  //sin uso
  function onDocumentLoadSuccess(doc) {
    // if a viewableId was specified, load that view, otherwise the default view
    console.log("doc load")
    doc.downloadAecModelData(() => resolve(doc));
/*     var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
    viewer.loadDocumentNode(doc, viewables).then(i => {
      // any additional action here?
    
    }); */
  }
  
  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }
  
}
//************************** */
function loadManifest( documentId ) {
  return new Promise(( resolve, reject ) => {
    const onDocumentLoadSuccess = ( doc ) => {
      doc.downloadAecModelData(() => resolve(doc));
      console.log("modelo cargado");

    };
    Autodesk.Viewing.Document.load( documentId, onDocumentLoadSuccess, onDocumentLoadFailure );
  });
}
function onDocumentLoadSuccess(doc) {
  // if a viewableId was specified, load that view, otherwise the default view
  doc.downloadAecModelData(() => resolve(doc));
/*     var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId) : doc.getRoot().getDefaultGeometry());
  viewer.loadDocumentNode(doc, viewables).then(i => {
    // any additional action here?
  
  }); */
}

function onDocumentLoadFailure(viewerErrorCode) {
  console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
} 

//************************** */
function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}

/* function loadManifest( documentId ) {
  return new Promise(( resolve, reject ) => {
    const onDocumentLoadSuccess = ( doc ) => {
      doc.downloadAecModelData(() => resolve(doc));
    };
    Autodesk.Viewing.Document.load( documentId, onDocumentLoadSuccess, reject );
  });
} */
/* function userFunction(pdb){
  var attrIdAct = -1;
  var dbids=[];
  
  // Iterate over all attributes and find the index to the one we are interested in
  pdb.enumAttributes(function(i, attrDef, attrRaw){

      var name = attrDef.displayName;
      
      if (name === 'ADIF_01_Id_Activo') {
          attrIdAct = i;
         // console.log("encontrado")
          return true; // to stop iterating over the remaining attributes.
      }
  });
  if (attrIdAct === -1)
      return null;

    // Now iterate over all parts to find out which one is the most massive.

    pdb.enumObjects(function(dbId){

        // For each part, iterate over their properties.
        pdb.enumObjectProperties(dbId, function(attrId, valId){

            // Only process 'Mass' property.
            // The word "Property" and "Attribute" are used interchangeably.
            if (attrId === attrIdAct) {

                var value = pdb.getAttrValue(attrId, valId);
               if (value===""){
                dbids.push(dbId);
                console.log(value)
               } 
                

                // Stop iterating over additional properties when "Mass" is found.
                return true;
            }
        });
    });

    // Return results
    return dbids;
    
} */
///S

