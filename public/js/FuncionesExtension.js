//extension para leer el parametro que tiene la clasificacion del RIH, ponerla en un arbol y podel buscar elementos por ese codigo (hay mucho codigo reutilizado)
class FuncionesExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.tool = new FunTool(viewer);
        this.button = null;
    }
 
    async load() {
       
        this.viewer.toolController.registerTool(this.tool);
        console.log('FuncionesExtension  has been loaded.');
        return true;
    }
 
    async unload() {
        this.viewer.toolController.deregisterTool(this.tool);
        console.log('FuncionesExtension  has been unloaded.');
        return true;
    }
 
    onToolbarCreated(toolbar) {
        const controller = this.viewer.toolController;
        this.button = new Autodesk.Viewing.UI.Button('Funciones_Button');
        //this.button.setIcon('adsk-icon-box');
        this.button.icon.classList.add("glyphicon","glyphicon-th");
        let panel3=this.panel3;
        this.button.onClick = (ev) => {
            if (controller.isToolActivated(FunToolName)) {
                controller.deactivateTool(FunToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);

                panel3.setVisible(!panel3.isVisible());
            } else {
                controller.activateTool(FunToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);

                if (panel3 == null) {
                    panel3 = new FunPanel(this.viewer, this.viewer.container, 
                        'Funciones', 'Funciones',{localizeTitel:true,addFooter:false});
                        panel3.addVisibilityListener(vigilante);    
                } 
                // show/hide docking panel
               panel3.setVisible(!panel3.isVisible());
            }
        };
        this.button.setToolTip('Funciones RIH');
        let grupo=this.group=viewer.toolbar.getControl('draw-tool-group')
      // this.group = new Autodesk.Viewing.UI.ControlGroup('Fun-Group');
     
        this.group.addControl(this.button);
        toolbar.addControl(this.group);
        
    }
}

const FunToolName = 'FUN-tool';
const FunOverlayName = 'FUN-overlay';
 
class FunTool extends Autodesk.Viewing.ToolInterface {
    constructor(viewer) {
        super();
        this.viewer = viewer;
        this.names = [FunToolName];
        this.active = false;
        //this.snapper = null;
        //this.points = []; // Points of the currently drawn outline
        //this.mesh = null; // Mesh representing the currently drawn area
        // Hack: delete functions defined on the *instance* of a ToolInterface (we want the tool controller to call our class methods instead)
        delete this.register;
        delete this.deregister;
        delete this.activate;
        delete this.deactivate;
        delete this.getPriority;
        delete this.handleMouseMove;
        delete this.handleSingleClick;
        delete this.handleKeyUp;
        
    }
 
    register() {
        //this.snapper = new Autodesk.Viewing.Extensions.Snapping.Snapper(this.viewer, { renderSnappedGeometry: true, renderSnappedTopology: true });
        //this.viewer.toolController.registerTool(this.snapper);
        //this.viewer.toolController.activateTool(this.snapper.getName());
        console.log('FUN-tool registered.');
    }
 
    deregister() {
        //this.viewer.toolController.deactivateTool(this.snapper.getName());
        //this.viewer.toolController.deregisterTool(this.snapper);
        //this.snapper = null;
        console.log('FUN-tool unregistered.');
    }
 
    activate(name, viewer) {
        if (!this.active) {
            this.viewer.overlays.addScene(FunOverlayName);
            console.log('FUN-tool activated.');
            this.active = true;
            arbolFunciones()
            //console.log(arbolFunciones())
        }
    }
 
    deactivate(name) {
        if (this.active) {
            this.viewer.overlays.removeScene(FunOverlayName);
            console.log('FUN-tool deactivated.');
            this.active = false;
        }
    }
 
    getPriority() {
        return 42; // Feel free to use any number higher than 0 (which is the priority of all the default viewer tools)
    }
 
    handleMouseMove(event) {
        if (!this.active) {
            return false;
        }
    }
 

 
    handleSingleClick(event, button) {
        if (!this.active) {
            return false;
        }
    }
 



};
const datosFUN=[]
let uniArr=[]
function arbolFunciones(){
    //para cada modelo, obtener el valor del parametro ADIF_00_Codigo_producto, 
    //con esos valores generar el arbol de funciones del modelo federado. JStree sobre el panel
    console.log("crear arbol")
    let modelos=viewer.getAllModels();
console.log("numero de modelos: " +modelos.length)
   let numModelos=modelos.length

    //console.log(modelos[0].findProperty('ADIF_00_Codigo_Producto'))
    modelos.forEach(async function allMod(mod){
       
       let d= await getProps(mod,numModelos)
      
       
        //lanza asincronamente la llmada todos los modelos a la vez?¿, no se cuado tengo los datos...
    })
    //console.log(datosFUN)
   // console.log(datosFUN.length)
   //return datosFUN
    //console.log(x)
}

    async function getProps(modelo,numModelos){
        
        let opt={
            propFilter:['ADIF_00_Codigo_Producto','ADIF_00_Descripcion_Producto'],
             ignHidd:false    
        }
      let resp1= await modelo.findProperty('ADIF_00_Codigo_Producto')
      viewer.select(resp1,modelo,Autodesk.Viewing.SelectionType.MIXED)
console.log(resp1)
     modelo.getBulkProperties(resp1,opt,(res)=>{

      res.forEach(function pop(val){
        let dato={
            id:"",
            descripcion:""
        }

          //console.log (val.properties[28].displayValue)
        dato.id=val.properties[0].displayValue
        dato.descripcion=val.properties[1].displayValue
        datosFUN.push(dato)
      });
      //console.log(datosFUN.length)
      if (modelo.id==numModelos){
       // console.log("FIN")
       // console.log(datosFUN.length)
        uniqueFUN(datosFUN)
    }    
     },(err)=>{+console.log(err)}) 
   }   


 
//deja solo los objetos que son unicos, elimina duplicados
async function uniqueFUN(fun){
    
//console.log(fun.length)
//console.log(fun)

const UniqueObjectsArray=[]
let funUnicas=new Set()

fun.forEach(function (object){
    //console.log(object)
    const objectJSON=JSON.stringify(object)
    if(!funUnicas.has(objectJSON)){
UniqueObjectsArray.push(object)
    }
    funUnicas.add(objectJSON)
})
arbolFUN=[]
arbolFUN.push(new activo("ACT","#","FUNCIONES","Encabezado","Propiedades"))
//creacion del array del arbol
UniqueObjectsArray.forEach(function(funcion){
    let idPadre=obtenerIdPadre(funcion.id)
    console.log(funcion.id)
    console.log(idPadre)
    let miFUN=new activo(funcion.id,idPadre,funcion.descripcion,"encabezado","propiedades")
    arbolFUN.push(miFUN)
    console.log(miFUN)
    //ACT bien de reutilizar el codigo de activos...podria cambiarse, pero hay que tocar activos...
    if(idPadre=="ACT"){
console.log("es ACT")
    }else{
        do {//crea el arbol entero, pero lo que no existe en el modelo le añade la descripcion de No modelado
            console.log("NO es ACT")
            let miFUN=new activo(idPadre,obtenerIdPadre(idPadre),"(No modelado)","encabezado","propiedades")
            console.log(miFUN)
            arbolFUN.push(miFUN)
            idPadre=obtenerIdPadre(idPadre)
            console.log(idPadre)
        } while (idPadre!="ACT");
    }

})
let arbolLimpio=new Set()
const arbolFUNUnico=[];
//elimina duplicados
arbolFUN.forEach(function (object){
    //console.log(object)
    const objectJSON=JSON.stringify(object)
    if(!arbolLimpio.has(objectJSON)){
arbolFUNUnico.push(object)
    }
    arbolLimpio.add(objectJSON)
})
console.log(arbolFUNUnico)
createJSTreeFUN(arbolFUNUnico)


}
function updateFunciones(){
    //solo actualiza lo que se muestra en el panel, no se si puedo obtener todos los datos antes de que se muestre el panel, asi que lo actualizo.¿?
}
let arbolFUN=[]
//crea el arbol, esta funcion si se parametrizase valdria para los 3 arboles que hay en la plicación...paquete...
function createJSTreeFUN(jsondata) { 
    //console.log(jsondata); 
    //no actualizo el arbol, lo destruyo y lo recreo entero
    $('#infoFUN').jstree("destroy").empty()
          
    $('#infoFUN').jstree({
        'themes': { "icons": true },
        'core': {
            //'data': jsondata
            'data':    jsondata,
            "animation": 0},
    'types': {
        'default': { 'icon': 'glyphicon glyphicon-question-sign' },
        '#': { 'icon': './img/Railway.svg' },
        'Activo': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
        'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
        'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
        'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
        'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },      
        'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
        'items': { 'icon': 'glyphicon glyphicon-file' },
        'activo': { 'icon': './img/boxes.svg' },
        'elemento': { 'icon': './img/box.svg' },
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
      "plugins": ["types", "state", "sort","wholerow"],
      "state": { "key": "autodeskHubs" }// key restore tree state
    })
    .bind("activate_node.jstree", function (evt, data) {
      if (data != null && data.node != null && (data.node.type == 'elemento')) {
        // in case the node.id contains a | then split into URN & viewableId
        if (data.node.id.indexOf('|') > -1) {
          var urn = data.node.id.split('|')[1];
          var viewableId = data.node.id.split('|')[2];
          console.log("click_1");
          
        }
        else {
          console.log("click en arbol de activos");
          //Seleccionar elementos del modelo con ese product code
          console.log(data.node.id);
         getActivos("ADIF_00_Codigo_Producto",data.node.id);

          
        }
      }
    })
 }

// My Awesome (Docking) Panel
// *******************************************
function FunPanel(viewer, container, id, title, options) {
    this.viewer = viewer;
    Autodesk.Viewing.UI.DockingPanel.call(this, container, id, title, options);
  
    // the style of the docking panel
    // use this built-in style to support Themes on Viewer 4+
    this.container.classList.add('docking-panel-container-solid-color-a');
    this.container.style.top = "10px";
    this.container.style.left = "10px";
    
    this.container.style.width = "auto";
    this.container.style.height = "auto";
    this.container.style.resize = "none";
  
    // this is where we should place the content of our panel
    var div = document.createElement('div');
    div.id="infoFUN"
    div.style.margin = '20px';
if(uniArr.length>0){
    div.innerText = uniArr  
}else{
    div.innerText = "Recopilando informacion"  
}
   
  
    
    this.container.appendChild(div);
  console.log("fin de panel")
    // and may also append child elements...
  
  };
  
  function  vigilante(show) {
      //console.log("vigilante")
    if( show ) {
      // Logic for opening the panel
      console.log("show!!");
     
    } else {
      // Logic for closing the panel
      console.log("Hide");
      //No se como acceder al viewer desde aqui...NOP_VIEWER no se si es muy ortodoxo...
      NOP_VIEWER.toolController.deactivateTool(FunToolName);
      
      let grupo=viewer.toolbar.getControl('draw-tool-group');
      grupo.getControl("Funciones_Button").setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      ///si cierro el panel deberia desactivar el la herramienta...

        
    }
};
onSelectionEvent = function(event) {
    console.log('reaccion evento');
   // console.log(this); 
    
  let viewer=this.viewer;
}
FunPanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
FunPanel.prototype.constructor = FunPanel;
Autodesk.Viewing.theExtensionManager.registerExtension('FuncionesExtension', FuncionesExtension);