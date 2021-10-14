//Drag and drop
console.log(XLSX.version);
console.log("ExcelTest");
function drop_handler(e) {
    console.log("evento drop");
    e.currentTarget.style.background = "lightyellow";
    e.stopPropagation(); e.preventDefault();
    var files = e.dataTransfer.files, f = files[0];
    console.log(files);
    var reader = new FileReader();
    reader.onload = function(e) {
       
      var data = new Uint8Array(e.target.result);
      console.log(data);
        var workbook = XLSX.read(data, {type: 'array'});
        console.log(workbook);
  
      /* DO SOMETHING WITH workbook HERE */
    };
    reader.readAsArrayBuffer(f);
  }

   
/*    function drop_handler(ev) {
    console.log("Drop");
    ev.currentTarget.style.background = "lightyellow";
   
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
   } */
   
   function dragover_handler(ev) {
    //console.log("dragOver");
    ev.preventDefault();
   }