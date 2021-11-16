//selección de elementos por parametro y valor
async function getActivos(paramName,paramValue){
    let modelos=viewer.getAllModels()
    let numModelos=modelos.length;
    console.log(modelos.length)   
    const dbIds_2=[];   
    
    modelos.forEach(async function(mod){
   // console.log(mod.id)     
    let index= mod.id-1   
    

    console.log('buscando '+ paramName + ' en modelo ' + mod.getData().loadOptions.bubbleNode.getRootNode().children[0].name());    
      let res = await viewer.impl.modelQueue().getModels()[index].getPropertyDb().executeUserFunction(`function userFunction(pdb) {
        
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


//console.log(dbIds_2) 
if (index==numModelos-1){
//final del bucle, ya he comprobado todos los modelos
//console.log(index)
viewer.impl.selector.setAggregateSelection( dbIds_2 );

//a veces tarda en encontrar las cosas y de cara al usuario parece que no hace nada...
//el fit to view en modelos agregados, es posible?
var box =viewer.utilities.getBoundingBox();
viewer.navigation.fitBounds( false, box ,true )
viewer.setSelectionColor(new THREE.Color(0xFF0000), Autodesk.Viewing.SelectionType.MIXED)
//console.log(box)

if (dbIds_2.length===0){
viewer.clearSelection()
}
}
    })

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
