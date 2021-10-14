
class SelectionChanged extends Autodesk.Viewing.Extension {
    constructor(viewer,options){
    super(viewer,options);
    this._group=null;
    this._button=null;
  }
  
  load(){
    
    this.onSelectionBinded = this.onSelectionEvent.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.onSelectionBinded);
  /*   let docelem=document.getElementById("limpiar");
    docelem.innerText="hola"; */
    //se podria cargar aqui el boton...

    console.log('Extension cargada, selectionChanged');
    return true;
  }
  unload(){
    
    this.viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.onSelectionBinded);
    this.onSelectionBinded = null;
    console.log("extension descargada selectionChanged");
    return true;
  }

  // Event hanlder for Autodesk.Viewing.SELECTION_CHANGED_EVENT
  //cuando cambia la seleccion busco una propiedad determinada en el primer objeto seleccionado y devuelvo su valor
  //TODO, que no se puedan elegir mas de una cosa o gestionar varios activos a la vez...

  onSelectionEvent = function(event) {
    console.log('reaccion evento');
   // console.log(this); 
    
  let viewer=this.viewer;

  const instanceTree = viewer.model.getData().instanceTree;
  const fragList = viewer.model.getFragmentList();
  let bounds = new THREE.Box3();
//console.log (fragList);//listado de los fragments del modelo, mallas


  var currSelection = this.viewer.getSelection();
  //console.log(currSelection[0]);
  let elem1=currSelection[0];
  console.log("antes del if, numero de elementos seleccionados: " + currSelection.length);
  if(currSelection.length>0){
  // let propiedades=this.viewer.getProperties(elem1,function(props){
  //   let result=props.properties.filter(obj=>{return obj.displayName==="ADIF_01_Id_Activo"})
  //   console.log(result[0].displayValue);
      //aqui podriamos llamar una funcion para que busque el activo correspondiente y sus propiedades
    console.log("dbid del primer elemento: " + elem1);
    instanceTree.enumNodeFragments( elem1, ( fragId ) => {
      let box = new THREE.Box3();
//listFragmentProperties(fragId)
      console.log("fragID:" + fragId);
      fragList.getWorldBounds( fragId, box );
      bounds.union( box );
  }, true );
/*   function listFragmentProperties(fragId) {
    console.log('Fragment ID:', fragId);
    // Get IDs of all objects linked to this fragment
    const objectIds = fragList.getDbIds(fragId);
    console.log('Linked object IDs:', objectIds);
    // Get the fragment's world matrix
    let matrix = new THREE.Matrix4();
    fragList.getWorldMatrix(fragId, matrix);
    console.log('World matrix:', JSON.stringify(matrix));
    // Get the fragment's world bounds
    let bbox = new THREE.Box3();
    fragList.getWorldBounds(fragId, bbox);
    console.log('World bounds:', JSON.stringify(bbox));
 
  }; */


  const position = bounds.getCenter(); //!<<< This is the selected object's position in the viewer world
  console.log(position);
//obtiene los modelos cargados y los apaga, o los descarga
//let mod=viewer.getAllModels();
//console.log(mod);
//viewer.unloadModel(mod[1]);
//viewer.hideModel(2); 
 //  });
    //console.log(propiedades);
    //var domElem = document.getElementById('MySelectionValue');
    //domElem.innerText = currSelection.length;

  };

  console.log("cambio en la seleccion de objetos: "+currSelection.length);
  };
//



};
//**************** */
//const viewer = new Autodesk.Viewing.GuiViewer3D(  document.getElementById('forgeViewer') );

// Other codes ...

//const selSet = viewer.getSelection();
//const targetElem = selSet[0];








//************************** */
  Autodesk.Viewing.theExtensionManager.registerExtension('SelectionChanged', SelectionChanged);
