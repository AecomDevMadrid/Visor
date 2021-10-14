let model = [];

function getModels(urn,viewableId){
//console.log(urn);
//console.log(viewableId);
model.push({name:"aaaa",urn:'urn:'+urn})

/* if (model.length>2){
    launchViewer(model) 
} */
}
function Federar(){
    if (model.length>0){
        launchViewer(model);
    }
else{
    alert("Debe seleccionar al menos un modelo");
}   
}
function Eliminar(){
model=[];
let listaModelos=document.getElementById("modelosFederar");
listaModelos.innerHTML=""; 
  
launchViewer(model);
}