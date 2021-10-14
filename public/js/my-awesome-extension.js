console.log('step1');
let contador=0;
function MyAwesomeExtension(viewer, options) {
    console.log("Awesome");
    Autodesk.Viewing.Extension.call(this, viewer, options);
    console.log("wwww");
   
  }
  
  MyAwesomeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
  MyAwesomeExtension.prototype.constructor = MyAwesomeExtension;
  
  MyAwesomeExtension.prototype.load = function() {
    alert('MyAwesomeExtension is loaded!');
    var viewer = this.viewer;
  

      if (this.viewer.toolbar) {
        // Toolbar is already available, create the UI
        this.createUI();
      } else {
        // Toolbar hasn't been created yet, wait until we get notification of its creation
        this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
        this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
      }
  
    return true;
  };
MyAwesomeExtension.prototype.onToolbarCreated = function() {
    this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
    this.onToolbarCreatedBinded = null;
    this.createUI();
  };
  
MyAwesomeExtension.prototype.createUI = function() {
    // alert('TODO: Create Toolbar!');
  
    var viewer = this.viewer;
  
    // Button 1
    var button1 = new Autodesk.Viewing.UI.Button('my-view-front-button');

    button1.onClick = function(e) {
      contador++;
    };
    //button1.addClass('my-view-front-button');
    button1.addClass('my-view-front-button')
    button1.setToolTip('View front');
  let panel=this.panel;
  

    // Button 2
    var button2 = new Autodesk.Viewing.UI.Button('my-view-back-button');
    button2.onClick = function(e) {
          // if null, create it
          if (panel == null) {
            panel = new MyAwesomePanel(viewer, viewer.container, 
                'awesomeExtensionPanel', 'My Awesome Extension');

        }
        // show/hide docking panel
        panel.setVisible(!panel.isVisible());
     
    };
    button2.addClass('my-view-back-button');
    button2.setToolTip('View Back');
  
    // SubToolbar
    this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-view-toolbar');
    this.subToolbar.addControl(button1);
    this.subToolbar.addControl(button2);
  
    viewer.toolbar.addControl(this.subToolbar);

  };
  
  MyAwesomeExtension.prototype.unload = function() {
    this.viewer.toolbar.removeControl(this.subToolbar);
    alert('MyAwesomeExtension is now unloaded!');
    return true;
  };


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
  this.container.style.resize = "auto";

  // this is where we should place the content of our panel
  var div = document.createElement('div');
  div.style.margin = '20px';
   let x= new Autodesk.Viewing.UI.DataTable(this);
   let rows=[];
   if (contador<1){
        rows = [
            ['Foo', 120000],
            ['Bar', 34],
            ['Baz', 56]
        ];}else{
        rows=   [
          'Foo', 12],
          ['Bar', 34],
          ['Baz', 56],
          ['Anx',33]
        }
        const cols = ['Name', 'Age'];
        x.setData(rows, cols);

  //div.innerText = "My content here";

  
  this.container.appendChild(div);

  // and may also append child elements...

}


MyAwesomePanel.prototype = Object.create(Autodesk.Viewing.UI.DockingPanel.prototype);
MyAwesomePanel.prototype.constructor = MyAwesomePanel;



  Autodesk.Viewing.theExtensionManager.registerExtension('MyAwesomeExtension', MyAwesomeExtension);