//modelos que se van a federar 

let model = [];
//Array con los modelos a cargar
function getModels(urn,nombre){
//console.log(urn);
//console.log("nombre: "+nombre);
model.push({name:nombre.trim(),urn:'urn:'+urn})
console.log(model)
/* if (model.length>2){
    launchViewer(model) 
} */
}
//Federa los modelos de la lista
function Federar(){
    //primer arranque, inicializa el viewer
    if (model.length>0 && viewer==null){
        launchViewer(model);
    }
else if(model.length>0 && viewer!==null){
    //una vez iniializado, reutiliza viewer y view
    const tasks = [];

    model.forEach( md => tasks.push( loadManifest( md.urn ) ) );
/*  */
    Promise.all(tasks)
    .then( docs =>  Promise.resolve( docs.map( doc => {
      const bubbles = doc.getRoot().search({type:'geometry', role: '3d'});
      const bubble = bubbles[0];
      if( !bubble ) return null;

      return bubble;
    })))
    .then( bubbles => view.setNodes( bubbles ) )
    


} else {
    alert("Debe seleccionar al menos un modelo");
}  
};
//Elimina todos los modelos
function Eliminar(){

    view.unloadAll()

model=[];
let listaModelos=document.getElementById("modelosFederar");
listaModelos.innerHTML=""; 
//launchViewer(model);
}
//Eliminar el modelo seleccionado de la lista
function EliminarSeleccionado(modelo){
//console.log(modelo);
//hay que quitarlo del array de modelos y del html
document.getElementById(modelo).remove();
model = model.filter(function(obj) {
    return obj.name !== modelo.trim();
  });
//console.log(model);
};