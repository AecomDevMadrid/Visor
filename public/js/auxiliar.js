//selección de elementos por parametro y valor
async function getActivos(paramName,paramValue){
    let modelos=viewer.getAllModels()
    let numModelos=modelos.length;
    console.log(modelos.length)   
    const dbIds_2=[];  
    let numSel=0; 
    console.log("inicio selActivos")
    console.log(dbIds_2)
    modelos.forEach(async function(mod){
   // console.log(mod.id)     
    let index= mod.id-1   
    

    console.log('buscando '+ paramName + ' en modelo ' + mod.getData().loadOptions.bubbleNode.getRootNode().children[0].name());    
     // let res = await viewer.impl.modelQueue().getModels()[index].getPropertyDb().executeUserFunction(`function userFunction(pdb) {
      let res = await viewer.getAllModels()[index].getPropertyDb().executeUserFunction(`function userFunction(pdb) {
        var attrIdAct = -1;
        var dbIds=[];
        //console.log(pdb)

        // Iterate over all attributes and find the index to the one we are interested in
        pdb.enumAttributes(function(i, attrDef, attrRaw){
      
            var name = attrDef.displayName;
            //console.log(name)
            if (name === '${paramName}') {
                attrIdAct = i;
               //console.log("encontrado_parametro")
                return true; // to stop iterating over the remaining attributes.
            }
          })
        
        
        if (attrIdAct === -1)
        return null;
  
      // Now iterate over all parts.
  
      pdb.enumObjects(function(dbId){
  
          // For each part, iterate over their properties.
          pdb.enumObjectProperties(dbId, function(attrId, valId){
  
              
              // The word "Property" and "Attribute" are used interchangeably.
              if (attrId === attrIdAct) {
  
                  var value = pdb.getAttrValue(attrId, valId);
                 // console.log(value)
                  let x='${paramValue}'
                  //console.log(x)
                 if (value===x){
                   //console.log(dbId)
                  dbIds.push(dbId);
                  //console.log(value)
                  //console.log("encontrado_elemento")
                 } 
                  
  
                  // Stop iterating over additional properties 
                  return true;
              }
          });
      });

      // Return results

      return dbIds

       
    }`);

    //console.log(res)
    let sel={
      model:modelos[index],
      ids:res
    }
dbIds_2.push(sel)
numSel=numSel+sel.ids.length
//Bbox de todos los modelos para cuando no se encuentra nada que haga zoon
allModelsBox(sel.model.getBoundingBox())
//Isolate para cada modelo, no podemos hacerlo para modelo agregado
if(sel.ids.length>0){
                    viewer.isolate(sel.ids,sel.model)
                    //viewer.select(sel.ids,sel.model)
                    viewer.setSelectionColor(new THREE.Color(0xFF0000), Autodesk.Viewing.SelectionType.MIXED)
                    }else{
//si no hay id no aisla nada y el modelo se ve opaco, no quiero eso
  //viewer.hideModel(sel.model.id)
  
                            let instanceTree = viewer.model.getData().instanceTree
                          let rootId = instanceTree.getRootId()
                          //console.log(rootId)
                          viewer.hide(rootId,sel.model) // hidding root node will hide whole model ..
                          //Algunos objetos, no quedan transparentes, por el material?? el terreno por ejemplo
                          }


//console.log(dbIds_2) 
if (index==numModelos-1){
//final del bucle, ya he comprobado todos los modelos
//console.log(index)
//
viewer.setAggregateSelection( dbIds_2 );

//a veces tarda en encontrar las cosas y de cara al usuario parece que no hace nada...
//el fit to view en modelos agregados, es posible?
if(numSel>0){
  console.log("dbid2 tiene algo")
  var box =viewer.utilities.getBoundingBox(true);
  viewer.navigation.fitBounds( false, box ,true )
  viewer.setSelectionColor(new THREE.Color(0xFF0000), Autodesk.Viewing.SelectionType.MIXED)
}else{
  console.log("nothing to select")
  viewer.clearSelection() 
  //no he conseguido que haga un zoom extension aqui, esto trabaja sobre el modelo activo y parece que no hay ninguno...
  //var box =viewer.utilities.getBoundingBox();
  
  viewer.navigation.fitBounds( false, allBbox ,true )
}
numSel=0

}
    })

}
//BBox de todos los modelos
let allBbox=new THREE.Box3
function allModelsBox(bbox){
  //console.log(bbox)
if (allBbox.max.x<bbox.max.x){allBbox.max.x=bbox.max.x}
if (allBbox.max.y<bbox.max.y){allBbox.max.y=bbox.max.y}
if (allBbox.max.z<bbox.max.z){allBbox.max.z=bbox.max.z}
if (allBbox.min.x>bbox.min.x){allBbox.min.x=bbox.min.x}
if (allBbox.min.y>bbox.min.y){allBbox.min.y=bbox.min.y}
if (allBbox.min.z>bbox.min.z){allBbox.min.z=bbox.min.z}
//console.log(allBbox)
}
//obtiene el nodo por ID del arbol de activos
function nodeSel(nodeId){
  //primero deselecciono todo
  $('#activos').jstree(true).deselect_all(true);
  //lo selecciono
  $('#activos').jstree(true).select_node(nodeId);
  //obtengo propiedades
  var node = $('#activos').jstree(true).get_node(nodeId)
  //console.log(node.original)
  //console.log(node.original.encabezado)
  //console.log(node.original.propiedades)
  //zoom en el nodo seleccionado-->implementado en el jstree
}
