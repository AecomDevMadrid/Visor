console.log('Ver todas las extensiones de serie');
class visorExtensiones extends Autodesk.Viewing.Extension {
  constructor(viewer,options){
    super(viewer,options);
    this._group=null;
    this._button=null;
  }
  load(){
    console.log('Visor de extensiones cargado');
    return true;
    
  }
  unload(){
    
    if(this._group){
      this._group.removeControl(this._button);
      if(this._group.getNumberOfControls()===0){
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("Visor de extensiones descargado");
    return true;
  }
  onToolbarCreated(toolbar){
    console.log("toolbar created keep moving");
    let viewer=this.viewer;
    const controller = this.viewer.toolController;
    let masterButton=this.button;
    masterButton = new Autodesk.Viewing.UI.ComboButton('Extensiones');
    masterButton.setIcon('adsk-icon-plus');
    masterButton.setToolTip('Mostrar extensiones');
    let ExtGeolocalizacion=this.button;
    ExtGeolocalizacion = new Autodesk.Viewing.UI.Button('Geolocalizacion');
    ExtGeolocalizacion.setIcon('adsk-icon-arrow');
    ExtGeolocalizacion.setToolTip('Geolocalizacion');
    let ExtMinimap=this.button;
    ExtMinimap = new Autodesk.Viewing.UI.Button('Minimap');
    ExtMinimap.setIcon('adsk-icon-arrow');
    ExtMinimap.setToolTip('Minimap');
    let ExtWireframe=this.button;
    ExtWireframe = new Autodesk.Viewing.UI.Button('Wireframe');
    ExtWireframe.setIcon('adsk-icon-arrow');
    ExtWireframe.setToolTip('Wireframe');

//anida botones
    masterButton.addControl(ExtGeolocalizacion);
    masterButton.addControl(ExtMinimap);
    masterButton.addControl(ExtWireframe);
    this.group = new Autodesk.Viewing.UI.ControlGroup('ext-group');
    this.group.addControl(masterButton);
    toolbar.addControl(this.group);
    ExtGeolocalizacion.onClick=(ev)=>{
      viewer.getExtension("Autodesk.Geolocation",(x)=>{x.activate})
      viewer.loadExtension('Autodesk.Geolocation').then(

        function(myExtension) {
      console.log("cargada");
          myExtension.activate();
          myExtension.setActive(true);
          let ext=viewer.getExtension('Autodesk.Geolocation');
          ext.setActive(true);
          console.log (ext)
        }, function (err) {
      
          console.log('Error loading extension: ')
          console.log(err)
        })
        
      
        

      };
      ExtMinimap.onClick=(ev)=>{
        viewer.getExtension("Autodesk.AEC.Minimap3DExtension",(x)=>{x.activate})
        viewer.loadExtension('Autodesk.AEC.Minimap3DExtension').then(
  
          function(myExtension) {
        console.log("cargada");
            myExtension.activate();
            myExtension.setActive(true);
            let ext=viewer.getExtension('Autodesk.AEC.Minimap3DExtension');
            ext.setActive(true);
            console.log (ext)
          }, function (err) {
        
            console.log('Error loading extension: ')
            console.log(err)
          })
          
        
          
  
        };
/*         if (viewer.getExtension("Autodesk.Geolocation",(X)=>{X.activate()})) {
           
          //  ExtGeolocalizacion.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
          // console.log("activo");
        } else {
            controller.activateTool("Autodesk.Geolocation");
            ExtGeolocalizacion.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);
            console.log("No activo");
        } */
    
/*     this.button.onClick = (ev) => {
        if (controller.isToolActivated("VisorExtensionesV01")) {
            controller.deactivateTool("VisorExtensionesV01");
            this.button.setState(Autodesk.Viewing.UI.Button.State.INACTIVE);
           
        } else {
            controller.activateTool("VisorExtensionesV01");
            this.button.setState(Autodesk.Viewing.UI.Button.State.ACTIVE);

        }
    }; */

 
  }

}
  Autodesk.Viewing.theExtensionManager.registerExtension('visorExtensiones', visorExtensiones);