var masterData;
const columns = ["Subject", "Details", "Object"];

function recieveFile(e){
	e.preventDefault();
	var file = e.dataTransfer.files[0];
	if(file.name.slice(-4) == ".tsv"){
		unloadFileMenu();
		var reader = new FileReader();
		reader.onload = (evt) => {
			getLines(evt.target.result);
		};
		reader.readAsText(file);
	}
}

async function getServerFile(fileName){
	unloadFileMenu();
	const response = await fetch(fileName);
	const responseText = await response.text();
	getLines(responseText);
}

async function getLines(fileText){
	//Not sure of a better way to filter comments.
	//This works perfectly well for all the data I've seen thusfar
	var lines = d3.tsvParse(removeComments(fileText));
  
	var keys = lines["columns"];
	var masterData = {}
	for (let y = 0; y < lines.length; y++) {
		var dataEntry = lines[y];
		var id = null, label = null, entry = {};
		for (let i = 0; i < keys.length; i++){
			if (keys[i] == "subject_id"){
				id = dataEntry[keys[i]];
			}
			else if (keys[i] == "subject_label"){
				label = dataEntry[keys[i]];
			}
			else{
				entry[keys[i]] = dataEntry[keys[i]];
			}
		}
		if (masterData[id] == null){
			masterData[id] = {"subject_id": id, "subject_label": label, "children":[entry]};
		}
		else {
			masterData[id]["children"].push(entry);
		}
	}
	
	clearTable();
	
	var table = document.getElementById("MainTable");
	var header = table.createTHead();
	var row = header.insertRow(0);
	for (let i = 0; i < columns.length; i++){
		var cell = row.insertCell();
		var tNode = document.createTextNode(columns[i]);
		cell.appendChild(tNode);
	}
	
	var body = table.createTBody();
	var idList = Object.keys(masterData);
	var cRow = 0;
	for (let y = 0; y < idList.length; y++) {
		createEntry(body, cRow, masterData[idList[y]]);
		cRow += masterData[idList[y]]["children"].length;
	}
}

function clearTable(){
	var table = document.getElementById("MainTable");
	const head = table.getElementsByTagName("thead");
	for (i = 0; i < head.length; i++){
		head[i].remove();
	}
	const body = table.getElementsByTagName("tbody");
	for (i = 0; i < body.length; i++){
		body[i].remove();
	}
}

function removeComments(tsv){
    var returnText = "";
    var lines = tsv.split('\n').filter(checkComment);
	for (let i = 0; i < lines.length; i++){
	    returnText += lines[i] + '\n';
	}
    return returnText;
}

function checkComment(line){
	//This seems to be the standard for comments.
	//If other comment types show up this will be changed
	return line[0] != '#' && line.length != 0;
}

function createEntry(p, index, data){
    var row = p.insertRow(index);
	createSubjectCell(row, data);
	for (var y = 0; y < data["children"].length; y++){
		if (y > 0){
			row = p.insertRow(y+index);
		}
		createObjectRow(row, y, data);
	}
}

function createSubjectCell(r, data){
    var cell = r.insertCell();
    var tText;
	cell.setAttribute("rowspan", data["children"].length);
    if (data.hasOwnProperty("subject_label")){
	    if (data.hasOwnProperty("subject_id")){
	        cell.setAttribute("title", data["subject_id"]);
	    }
	    tText = data["subject_label"];
    }
    else if (data.hasOwnProperty("subject_id")) {
	    tText = data["subject_id"];
    }
    else {
	    tText = "Data not available";
    }
    var tNode = document.createTextNode(tText);
    cell.appendChild(tNode);
}

function createObjectRow(r, i, data){
	var child = data["children"][i];
	
    var predCell = r.insertCell();
	var predText = child["predicate_id"];
	//predCell.setAttribute("onclick", "loadDetails(" + index + ")");
	predCell.append(predText);
	
	var objCell = r.insertCell();
	var objText;
    if (child.hasOwnProperty("object_label")){
	    if (child.hasOwnProperty("object_id")){
	        cell.setAttribute("title", child["object_id"]);
	    }
	    tText = child["object_label"];
    }
    else if (child.hasOwnProperty("object_id")) {
	    objText = child["object_id"];
    }
    else {
	    objText = "Data not available";
    }
	objCell.append(objText);
}

function createCellComplex(r, data, mChar, primary, secondary){
    var container = r.insertCell();
    for (var i = 0; i < data["children"].length; i++){
	    var cell = document.createElement( 'div' );
	    container.appendChild(cell);
	    //var cell = cr.insertCell(i);
	    var localData = data["children"][i];
        if (localData.hasOwnProperty(primary)){
	        if (localData.hasOwnProperty(secondary)){
	            cell.setAttribute("title", localData[secondary]);
	        }
	        tText = localData[primary];
        }
        else if (localData.hasOwnProperty(secondary)) {
	        tText = localData[secondary];
        }
        else {
	        tText = "Data not available";
        }
        var tNode = document.createTextNode(tText);
        cell.appendChild(tNode);
    }
}

function unloadFileMenu(){
	var fileWindow = document.getElementById("DragAndDrop");
	fileWindow.style.display = "none";
}

function loadFileMenu(){
	var fileWindow = document.getElementById("DragAndDrop");
	fileWindow.style.display = "block";
}

function unloadDetails(){
  var table = document.getElementById("DetailTable");
  table.innerHTML = "";
  var holder = document.getElementById("DetailTableHolder");
  holder.style.display = "none";
}

function loadDetails(index){
  var table = document.getElementById("DetailTable");
  var keys = Object.keys(masterData[index]);
  for (let i = 0; i < keys.length; i++){
    var row = table.insertRow(i);
	var left = row.insertCell();
	var leftText = document.createTextNode(keys[i]);
	left.appendChild(leftText);
	var right = row.insertCell();
	var rightText = document.createTextNode(masterData[index][keys[i]]);
	right.appendChild(rightText);
  }
  console.log(masterData[index]);
  var holder = document.getElementById("DetailTableHolder");
  holder.style.display = "block";
}
