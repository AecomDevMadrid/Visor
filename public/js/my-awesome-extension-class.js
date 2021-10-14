console.log('extension mediante clase');
class MyAwesomeExtension2 extends Autodesk.Viewing.Extension {
  constructor(viewer,options){
    super(viewer,options);
    this._group=null;
    this._button=null;
  }
  load(){
    console.log('Extension cargada mediante clase');
    return true;
    
  }
  unload(){
    
    if(this._group){
      this._group.removeControl(this._button);
      if(this._group.getNumberOfControls()===0){
        this.viewer.toolbar.removeControl(this._group);
      }
    }
    console.log("extension descargada mediante clase");
    return true;
  }
  onToolbarCreated(){
    console.log("toolbar created");
    let viewer=this.viewer;
    
 
  }

}
  Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension2', MyAwesomeExtension2);