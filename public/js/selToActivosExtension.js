//extension para consultar los activos, modelo-->arbol de activos y seleccion en modelo del conjunto de lementos que conforman el activo
class selToActivosExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.tool = new SelTool(viewer);
        this.button = null;
    }
 
    async load() {
        await this.viewer.loadExtension('Autodesk.Snapping');
        this.viewer.toolController.registerTool(this.tool);
        console.log('selToActivos has been loaded.');
        return true;
    }
 
    async unload() {
        this.viewer.toolController.deregisterTool(this.tool);
        console.log('selToActivos has been unloaded.');
        return true;
    }
 
    onToolbarCreated(toolbar) {
        const controller = this.viewer.toolController;
        this.button = new Autodesk.Viewing.UI.Button('selToActivos_Button');
        this.button.icon.classList.add('glyphicon','glyphicon-briefcase');
        let panel2=this.panel2;
        this.button.onClick = (ev) => {
            if (controller.isToolActivated(SelToolName)) {
                controller.deactivateTool(SelToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);

                panel2.setVisible(!panel2.isVisible());
            } else {
                controller.activateTool(SelToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);

                if (panel2 == null) {
                    panel2 = new MyAwesomePanel2(this.viewer, this.viewer.container, 
                        'Propiedades_activo', 'Propiedades activo',{localizeTitel:true,addFooter:false});
                        panel2.addVisibilityListener(vigilante);    
                } 
                // show/hide docking panel
               panel2.setVisible(!panel2.isVisible());
            }
        };
        this.button.setToolTip('Activos de la seleccion');
        this.group=viewer.toolbar.getControl('draw-tool-group')
       // this.group = new Autodesk.Viewing.UI.ControlGroup('draw-tool-group2');
        this.group.addControl(this.button);
        toolbar.addControl(this.group);
        
    }
}

const SelToolName = 'Sel-tool';
const SelOverlayName = 'Sel-overlay';
 
class SelTool extends Autodesk.Viewing.ToolInterface {
    constructor(viewer) {
        super();
        this.viewer = viewer;
        this.names = [SelToolName];
        this.active = false;
        this.snapper = null;
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
        this.snapper = new Autodesk.Viewing.Extensions.Snapping.Snapper(this.viewer, { renderSnappedGeometry: true, renderSnappedTopology: true });
        this.viewer.toolController.registerTool(this.snapper);
        this.viewer.toolController.activateTool(this.snapper.getName());
        console.log('SelTool registered.');
    }
 
    deregister() {
        this.viewer.toolController.deactivateTool(this.snapper.getName());
        this.viewer.toolController.deregisterTool(this.snapper);
        this.snapper = null;
        console.log('SelTool unregistered.');
    }
 
    activate(name, viewer) {
        if (!this.active) {
            this.viewer.overlays.addScene(SelOverlayName);
            console.log('SelTool activated.');
            this.active = true;
            
            if(this.viewer.toolController.isToolActivated('draw-bounds-tool')){
                $('#draw-bounds-tool-button').click()
            }
            this.viewer.canvas.style.cursor = "pointer"
        }
    }
 
    deactivate(name) {
        if (this.active) {
            this.viewer.overlays.removeScene(SelOverlayName);
            console.log('SelTool deactivated.');
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
 
        this.snapper.indicator.clearOverlays();
        if (this.snapper.isSnapped()) {
            const result = this.snapper.getSnapResult();
            const { SnapType } = Autodesk.Viewing.MeasureCommon;
            switch (result.geomType) {
               case SnapType.SNAP_VERTEX:
               this.snapper.indicator.render(); // Show indicator when snapped to a vertex
               break;
               // case SnapType.SNAP_MIDPOINT:
               // case SnapType.SNAP_INTERSECTION:
               // case SnapType.SNAP_CIRCLE_CENTER:
                case SnapType.RASTER_PIXEL:
                    // console.log('Snapped to vertex', result.geomVertex);
                    this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                    //console.log(result.geomVertex);
                    //this._update(result.geomVertex);
                    break;
               case SnapType.SNAP_EDGE:
                   this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                   break;
               // case SnapType.SNAP_CIRCULARARC:
               // case SnapType.SNAP_CURVEDEDGE:
                    // console.log('Snapped to edge', result.geomEdge);
                   // break;
                case SnapType.SNAP_FACE:
                   // this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                   this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                case SnapType.SNAP_CURVEDFACE:
                    // console.log('Snapped to face', result.geomFace);
                    this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                    break;
            }
        }
        return false;
    }
 
    handleSingleClick(event, button) {
        if (!this.active) {
            return false;
        }
 
        if (button === 0 && this.snapper.isSnapped()) {
            const result = this.snapper.getSnapResult();
            const { SnapType } = Autodesk.Viewing.MeasureCommon;
            let idToSel
            let mode
            let opt={propFilter:["ADIF_01_Id_Activo"],
            ignoreHidden:true,
            needsExternalId:false
            }
            switch (result.geomType) {
                case SnapType.SNAP_VERTEX:
                                       // console.log(result.snapNode);//id del elemento?
                    //console.log(result.modelId);//id del modelo?
                    idToSel=[result.snapNode]
                   // console.log(idToSel)
                    mode=viewer.getAllModels()[result.modelId-1]
                   //console.log(mode)
                    viewer.select(idToSel,mode,Autodesk.Viewing.SelectionType.MIXED)
        
                    mode.getPropertySet(idToSel,valorObtenido,(x)=>{console.log(x)},opt)
                    
                    //this._update(datos)
                    //
                    break
                //case SnapType.SNAP_MIDPOINT:
                case SnapType.SNAP_EDGE:
                                   // console.log(result.snapNode);//id del elemento?
                    //console.log(result.modelId);//id del modelo?
                    idToSel=[result.snapNode]
                    mode=viewer.getAllModels()[result.modelId-1]
                   
                    viewer.select(idToSel,mode,Autodesk.Viewing.SelectionType.MIXED)

                    mode.getPropertySet(idToSel,valorObtenido,(x)=>{console.log(x)},opt)
                    
                    //this._update(datos)
                    //
                    break
                //case SnapType.SNAP_INTERSECTION:
                //case SnapType.SNAP_CIRCLE_CENTER:
                case SnapType.SNAP_FACE:
                   // console.log(result.snapNode);//id del elemento?
                    //console.log(result.modelId);//id del modelo?
                    idToSel=[result.snapNode]
                    mode=viewer.getAllModels()[result.modelId-1]
                   
                    viewer.select(idToSel,mode,Autodesk.Viewing.SelectionType.MIXED)

                    mode.getPropertySet(idToSel,valorObtenido,(x)=>{console.log(x)},opt)
                    
                    //this._update(datos)
                    //
                    break
                case SnapType.SNAP_CURVEDFACE:
                    //console.log(result);
                    idToSel=[result.snapNode]
                    mode=viewer.getAllModels()[result.modelId-1]
                   
                    viewer.select(idToSel,mode,Autodesk.Viewing.SelectionType.MIXED)

                    mode.getPropertySet(idToSel,valorObtenido,(x)=>{console.log(x)},opt)
                    break
                //case SnapType.RASTER_PIXEL:
                    //this.points.push(result.geomVertex.clone());
                    //console.log(result.geomVertex);
                    
                    //this._update(result.geomVertex.clone());
                   // break;
                default:
                    // Do not snap to other types
                    break;
            }
            return true; // Stop the event from going to other tools in the stack
        }
        return false;
    }
 //esto lo esa para cancelar el dibujo de la malla, a mi no me sirve
/*     handleKeyUp(event, keyCode) {
        if (this.active) {
            if (keyCode === 27) {
                // Finalize the extrude mesh and initialie a new one
                console.log ("escape");
                this.points = [];
                this.mesh = null;
                return true;
            }
        }
        return false;
    } */
    //transformacion de coordenadas locales a globales (ojo, conocimientos justitos sobre como funciona la localizacion)
  

 //esta parte dibuja una malla, no me sirve para lo que busco
/*     _update(intermediatePoint = null) {
        console.log ("update");
        if ((this.points.length + (intermediatePoint ? 1 : 0)) > 2) {
            console.log("in update");
            if (this.mesh) {
                this.viewer.overlays.removeMesh(this.mesh, DrawBoundsOverlayName);
            }
            let minZ = this.points[0].z, maxZ = this.points[0].z;
            let shape = new THREE.Shape();
            shape.moveTo(this.points[0].x, this.points[0].y);
            for (let i = 1; i < this.points.length; i++) {
                shape.lineTo(this.points[i].x, this.points[i].y);
                minZ = Math.min(minZ, this.points[i].z);
                maxZ = Math.max(maxZ, this.points[i].z);
            }
            if (intermediatePoint) {
                shape.lineTo(intermediatePoint.x, intermediatePoint.y);
                minZ = Math.min(minZ, intermediatePoint.z);
                maxZ = Math.max(maxZ, intermediatePoint.z);
            }
            let geometry = new THREE.BufferGeometry().fromGeometry(new THREE.ExtrudeGeometry(shape, { steps: 1, amount: maxZ - minZ, bevelEnabled: false }));
            let material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.position.z = minZ;
            this.viewer.overlays.addMesh(this.mesh, DrawBoundsOverlayName);
            this.viewer.impl.sceneUpdated(true);
        }
    } */


}

function valorObtenido(ppset){
    console.log("valor obtenido")
    console.log(ppset)
    //let val=ppset.getValue2PropertiesMap(key)
    datos=[]
    ppset.forEach((name, properties) => {
        //const commonValues = ppset.getValue2PropertiesMap(name);
        //console.log(commonValues)
        //console.log(name)
        let res=properties[0].displayValue
        //console.log(properties[0].displayValue)
        //selecciono el nodo
        var node = $('#activos').jstree(true).get_node(res)
        //node tiene la información del activo, encabezados y valores
        //console.log(node)
        let encabezado=node.original.encabezado
        //console.log(encabezado)
        let valores=node.original.propiedades
        //console.log(valores)
        let contador=encabezado.length
        //console.log(contador)
        let linea=[]
        
        for (let i=0;i<contador;i++){
            linea=[encabezado[i],valores[i]]
           // console.log(linea)
            datos.push(linea)
        }
        actualiza(datos)
        //console.log(datos)
        //console.log(node)
        nodeSel(res)
      });
    }

    let datos=[];
    function actualiza(datos){

        console.log("actualizando...")
        //console.log(datos)
        let tabla2=$('#Propiedades_activo #bodyArea')[0]
                //let tabla2=document.getElementById("bodyArea");
                tabla2.innerHTML=""
                //hay que actualizar la tabla entera, vaciarla y añadir todas las filas
               
                let contador=datos.length//numero de rows
                
                for(let i=0;i<contador;i++){
                    let fila=document.createElement("tr")   
        let celda1=document.createElement("td")
        let celda2=document.createElement("td")
        let propiedad=document.createTextNode(datos[i][0])
        let valor=document.createTextNode(datos[i][1])
        celda1.appendChild(propiedad)
        celda2.appendChild(valor)
        fila.appendChild(celda1)
        fila.appendChild(celda2)
        tabla2.appendChild(fila)
                    //console.log(datos[i])
                    //tabla2.rows[i].cells[0].innerHTML=datos[i][0];
                    //tabla2.rows[i].cells[1].innerHTML=datos[i][1];
                    //tabla.rows[2].cells[1].innerHTML=datos[1].valor;
                }
            
        
               
                
        
            }
//let punto=[0,0,0];
    // *******************************************
// My Awesome (Docking) Panel
// *******************************************
function MyAwesomePanel2(viewer, container, id, title, options) {
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
    div.style.margin = '20px';
     let x= new Autodesk.Viewing.UI.DataTable(this);
     let rows=[];
     
          rows = [
              ['X', '...'],
              ['Y', '...'],
              ['Z', '...']

          ];
          const cols = ['Propiedad', 'Valor'];
          x.setData(rows, cols);
  x.id="tabla2";
   // div.innerText = "My content here";
  
    
    this.container.appendChild(div);
  
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
      NOP_VIEWER.toolController.deactivateTool(SelToolName);
      
      let grupo=NOP_VIEWER.toolbar.getControl('draw-tool-group');
      grupo.getControl("selToActivos_Button").setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      ///si cierro el panel deberia desactivar el la herramienta...

        
    }
};
onSelectionEvent = function(event) {
    console.log('reaccion evento');
   // console.log(this); 
    
  let viewer=this.viewer;
}
  MyAwesomePanel2.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MyAwesomePanel2.prototype.constructor = MyAwesomePanel2;
Autodesk.Viewing.theExtensionManager.registerExtension('selToActivosExtension', selToActivosExtension);