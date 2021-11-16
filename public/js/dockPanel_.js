

// *******************************************
// My Awesome (Docking) Panel
// *******************************************
//SIN USO, SOLO PRUEBAS
function MyAwesomePanel_W(viewer, container, id, title, options) {
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
            ['Foo', 100],
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

//module.exports(MyAwesomePanel);
