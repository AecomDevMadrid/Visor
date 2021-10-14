let registroActivos=[];//array con todos los activos en forma de objeto
let miActivo=new activo("ACT","#","Activos ferroviarios","","propiedades");
registroActivos.push(miActivo);
function dragover_handler(ev) {
    //console.log("dragOver");
    ev.preventDefault();
   }
function handleFileLoad(e) {
		e.currentTarget.style.background = "lightyellow";
		e.stopPropagation(); e.preventDefault();
		//console.log(e);
		//console.log(e);
		var files = e.dataTransfer.files, file = files[0];
		
		//SIN CONTROLAR EL TIPO DE ARCHIVOS
		if (file.type !="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
			console.log("no es excel");
			};
		//console.log(files);
		let contador=0;
    	if (files.length > 0) {
        	try {
				//this.setState({ operationInProgress: true, fileLoadProgress: 0 });
			// let file = e[0];
				//console.log(file);
				let reader = new FileReader();
				
				//console.log(file);
				reader.onload =  function (e) {
					//console.log(e);
					contador=contador+1;
					let data = new Uint8Array(e.target.result);
					//console.log("data:");
					//console.log(data);
					//let workbook = XLSX.read(data, { type: "array" });
			
					let workbook = XLSX.read(data, { type: "array" });
					//console.log("WK");
					//console.log(workbook);
					let hojas=workbook.SheetNames;

					console.log("Hojas:" + hojas);
					//console.log(workbook.Sheets[hojas[1]]);
					
					
					 hojas.forEach(function(hoja){
						//console.log(hoja);
						let worksheet = workbook.Sheets[hoja];
						let sheet = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
						//console.log("esto es la sheet: ");
						//console.log(sheet);
						//sheet es un array, el item 0 es el encabezado, el resto son datos
						let numeroActivos=sheet.length;
						//console.log(numeroActivos);
						let i;
						for(i=1;i<numeroActivos;i++){
							let id=sheet[i][0];
							let idPadre=obtenerIdPadre(id);			
							let descripcion=sheet[i][1];
							let encabezado=sheet[0];
							let propiedades=sheet[i];
							
							//console.log(id);
							//console.log(descripcion);
							//console.log(encabezado);
							//console.log(propiedades);
							//console.log("idp: " + idPadre);
							let miActivo=new activo(id,idPadre,descripcion,encabezado,propiedades);
							registroActivos.push(miActivo);
							//console.log(miActivo);
							//console.log(sheet[i]);
							//console.log("wwww"+i);
						}
						
						}) 

				//console.log(registroActivos);
				

				};
		//aqui llama al reader, vinculado con el reader.onload		
		console.log(reader.readAsArrayBuffer(files[0]));
		//procesado del resto de excels, cuando termina de cargar uno procesa el siguiente
		reader.onloadend=function (w){
			//console.log (w);
			if (contador <files.length){
				reader.readAsArrayBuffer(files[contador]);
			}else{
				//cuando ha terminado con todos genera el arbol
				createJSTree(registroActivos);
			}
			
		}
		
			console.log("cargado");

        } catch (exception) {
           // this.setState({
           //     fileLoaded: false,
           //     fileName: "",
           //     operationInProgress: false
           // });
		   console.log(exception);
        }
    } else {
        toast("No files found", { type: "error" });
    }
};

function onGeneratedRow(columnsResult)
{
	console.log("Inicio conversion");
	console.log(registroExterno);
    var jsonData = {};
	let c=1;
	const longitudData=columnsResult.length;
	const longitudDato=columnsResult[0].length;
	let i;
	var columnName;
	for(i=1;i<longitudData;i++){
		//console.log("fila: " +i);
		//console.log(columnsResult[i]);
		for(j=1;j<longitudDato;j++){
			//console.log("columna: " +j);
			let columnName=columnsResult[0][j];
			//console.log(columnName);
			jsonData[columnName]=columnsResult[i][j];
			
			
		}
		//console.log(jsonData);
		registroExternoJson.push(jsonData);
		jsonData={};//si no vacio el objeto no funciona.
	};
	
	//console.log(columnsResult.length);
    //columnsResult.forEach(function(column) 
    //{
		//console.log(column);
       // var columnName = "Col"+c;
       // jsonData[columnName] = column;
		//c++;
   // });
   // registroExternoJson.push(jsonData);
	console.log(registroExternoJson);
	addFilas(registroExternoJson);
 }
//funcion constructora de un objeto activo
function activo(id,idPadre,descripcion,encabezado,propiedades){
	this.id=id;//id del activo
	this.parent=idPadre;//id padre
	this.text=id + "-" + descripcion;//descripcion del activo
	//this.icon="glyphicon glyphicon-file";
	this.encabezado=encabezado;//array con los encabezados de la tabla de propiedades del activo
	this.propiedades=propiedades;//array con las propiedades del activo
	this.type="versions";
}
function obtenerIdPadre(id){
	//console.log("obteniendo ID Padre");
	let partido=id.split(".");
	let numPartes=partido.length;	
	//console.log("numero: "+ numPartes);
	//console.log(partido);
	if(numPartes==1){
		return "ACT"//es root
	}else if(numPartes==2){
		return partido[0];
	}
	else{
		partido.pop()
		//console.log (partido);
		let pd=partido.join(".");		
		return pd;
	}
}
function createJSTree(jsondata) { 
			console.log(jsondata); 
			//no actualizo el arbol, lo destruyo y lo recreo entero
			$('#activos').jstree("destroy").empty()
			      
            $('#activos').jstree({
				'themes': { "icons": true },
                'core': {
                    //'data': jsondata
					'data':    jsondata},
			'types': {
				'default': { 'icon': 'glyphicon glyphicon-question-sign' },
				'#': { 'icon': 'glyphicon glyphicon-user' },
				'hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
				'personalHub': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360hub.png' },
				'bim360Hubs': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360hub.png' },
				'bim360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/bim360project.png' },
				'a360projects': { 'icon': 'https://github.com/Autodesk-Forge/bim360appstore-data.management-nodejs-transfer.storage/raw/master/www/img/a360project.png' },      
				'folders': { 'icon': 'glyphicon glyphicon-folder-open' },
				'items': { 'icon': 'glyphicon glyphicon-file' },
				'bim360documents': { 'icon': 'glyphicon glyphicon-file' },
				'versions': { 'icon': 'glyphicon glyphicon-time' },
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
			  "plugins": ["types", "state", "sort"],
			  "state": { "key": "autodeskHubs" }// key restore tree state
			}).bind("activate_node.jstree", function (evt, data) {
			  if (data != null && data.node != null && (data.node.type == 'versions')) {
				// in case the node.id contains a | then split into URN & viewableId
				if (data.node.id.indexOf('|') > -1) {
				  var urn = data.node.id.split('|')[1];
				  var viewableId = data.node.id.split('|')[2];
				  console.log("click_1");
				  
				}
				else {
				  console.log("click_2");
				  //Carga el modelo
				  console.log(data.node);
				  console.log(data.node.original.encabezado);
				  console.log(data.node.original.propiedades);
				  
				}
			  }
			});
			
			//$('#activos').jstree(true).redraw(true);

		  }

