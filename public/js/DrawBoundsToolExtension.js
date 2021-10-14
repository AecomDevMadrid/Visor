class DrawBoundsToolExtension extends Autodesk.Viewing.Extension {
    constructor(viewer, options) {
        super(viewer, options);
        this.tool = new DrawBoundsTool(viewer);
        this.button = null;
    }
 
    async load() {
        await this.viewer.loadExtension('Autodesk.Snapping');
        this.viewer.toolController.registerTool(this.tool);
        console.log('DrawBoundsToolExtension has been loaded.');
        return true;
    }
 
    async unload() {
        this.viewer.toolController.deregisterTool(this.tool);
        console.log('DrawBoundsToolExtension has been unloaded.');
        return true;
    }
 
    onToolbarCreated(toolbar) {
        const controller = this.viewer.toolController;
        this.button = new Autodesk.Viewing.UI.Button('draw-bounds-tool-button');
        this.button.setIcon('adsk-icon-measure-calibration');
        let panel=this.panel;
        this.button.onClick = (ev) => {
            if (controller.isToolActivated(DrawBoundsToolName)) {
                controller.deactivateTool(DrawBoundsToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
                panel.setVisible(!panel.isVisible());
            } else {
                controller.activateTool(DrawBoundsToolName);
                this.button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
                if (panel == null) {
                    panel = new MyAwesomePanel(this.viewer, this.viewer.container, 
                        'Coordenadas', 'Coordenadas',{localizeTitel:true,addFooter:false});
                        panel.addVisibilityListener(vigilante);    
                }
                // show/hide docking panel
                panel.setVisible(!panel.isVisible());
            }
        };
        this.button.setToolTip('Coordenadas de vertices');
        this.group = new Autodesk.Viewing.UI.ControlGroup('draw-tool-group');
        this.group.addControl(this.button);
        toolbar.addControl(this.group);
        
    }
}

const DrawBoundsToolName = 'draw-bounds-tool';
const DrawBoundsOverlayName = 'draw-bounds-overlay';
 
class DrawBoundsTool extends Autodesk.Viewing.ToolInterface {
    constructor(viewer) {
        super();
        this.viewer = viewer;
        this.names = [DrawBoundsToolName];
        this.active = false;
        this.snapper = null;
        this.points = []; // Points of the currently drawn outline
        this.mesh = null; // Mesh representing the currently drawn area
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
        console.log('DrawBoundsTool registered.');
    }
 
    deregister() {
        this.viewer.toolController.deactivateTool(this.snapper.getName());
        this.viewer.toolController.deregisterTool(this.snapper);
        this.snapper = null;
        console.log('DrawBoundsTool unregistered.');
    }
 
    activate(name, viewer) {
        if (!this.active) {
            this.viewer.overlays.addScene(DrawBoundsOverlayName);
            console.log('DrawBoundsTool activated.');
            this.active = true;
        }
    }
 
    deactivate(name) {
        if (this.active) {
            this.viewer.overlays.removeScene(DrawBoundsOverlayName);
            console.log('DrawBoundsTool deactivated.');
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
                case SnapType.SNAP_MIDPOINT:
                case SnapType.SNAP_INTERSECTION:
                case SnapType.SNAP_CIRCLE_CENTER:
                case SnapType.RASTER_PIXEL:
                    // console.log('Snapped to vertex', result.geomVertex);
                    this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                    //console.log(result.geomVertex);
                    //this._update(result.geomVertex);
                    break;
                case SnapType.SNAP_EDGE:
                   // this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                case SnapType.SNAP_CIRCULARARC:
                case SnapType.SNAP_CURVEDEDGE:
                    // console.log('Snapped to edge', result.geomEdge);
                    break;
                case SnapType.SNAP_FACE:
                   // this.snapper.indicator.render(); // Show indicator when snapped to a vertex
                case SnapType.SNAP_CURVEDFACE:
                    // console.log('Snapped to face', result.geomFace);
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
            switch (result.geomType) {
                case SnapType.SNAP_VERTEX:
                case SnapType.SNAP_MIDPOINT:
                case SnapType.SNAP_INTERSECTION:
                case SnapType.SNAP_CIRCLE_CENTER:
                case SnapType.RASTER_PIXEL:
                    this.points.push(result.geomVertex.clone());
                    //console.log(result.geomVertex);
                    
                    this._update(result.geomVertex.clone());
                    break;
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
    _update(vertice){
        let viewer=this.viewer;
        let model=viewer.model;
        let offset=model.getGlobalOffset();
        let escalaUnidades=model.getUnitScale();

        console.log("vertice: ", vertice);
        console.log("escala: " + model.getUnitScale(), "unidades: " + model.getUnitString());
        console.log("offset: " , offset);
        let xWCS=(vertice.x+offset.x)*escalaUnidades;
        let yWCS=(vertice.y+offset.y)*escalaUnidades;
        let zWCS=(vertice.z+offset.z)*escalaUnidades;
        console.log(xWCS,yWCS,zWCS);
        punto[0]=xWCS;
        punto[1]=yWCS;
        punto[2]=zWCS;
        console.log(punto);
        let tabla=document.getElementById("contentArea");
        
        tabla.rows[0].cells[1].innerHTML=xWCS;
        tabla.rows[1].cells[1].innerHTML=yWCS;
        tabla.rows[2].cells[1].innerHTML=zWCS;
       
        

    }


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
let punto=[0,0,0];
    // *******************************************
// My Awesome (Docking) Panel
// *******************************************
function MyAwesomePanel(viewer, container, id, title, options) {
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
              ['X', punto[0]],
              ['Y', punto[1]],
              ['Z', punto[2]]
          ];
          const cols = ['Eje', 'Valor'];
          x.setData(rows, cols);
  x.id="tabla";
   // div.innerText = "My content here";
  
    
    this.container.appendChild(div);
  
    // and may also append child elements...
  
  };
  
  function  vigilante(show) {
    if( show ) {
      // Logic for opening the panel
      console.log("show!!");
      
    } else {
      // Logic for closing the panel
      console.log("Hide");
      //No se como acceder al viewer desde aqui...NOP_VIEWER no se si es muy ortodoxo...
      NOP_VIEWER.toolController.deactivateTool(DrawBoundsToolName);
      
      let grupo=NOP_VIEWER.toolbar.getControl('draw-tool-group');
      grupo.getControl("draw-bounds-tool-button").setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
      ///si cierro el panel deberia desactivar el la herramienta...

        
    }
};

  MyAwesomePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MyAwesomePanel.prototype.constructor = MyAwesomePanel;
Autodesk.Viewing.theExtensionManager.registerExtension('DrawBoundsToolExtension', DrawBoundsToolExtension);