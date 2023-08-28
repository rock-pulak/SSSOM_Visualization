var masterData;
var rankTypes;
var replacementStrings;
const columns = ["Subject", "Details", "Object"];

async function init(){
	await getRanks();
	await getReplacementStrings();
}

async function getRanks(){
	const response = await fetch("rankTypes.tsv");
	const responseText = await response.text();
	var lines = d3.tsvParse(removeComments(responseText));
	rankTypes = {};
	for (var i = 0; i < lines.length; i++){
		rankTypes[lines[i]["id"]] = lines[i]["rank"];
	}
}

async function getReplacementStrings(){
	const response = await fetch("commonReplacements.tsv");
	const responseText = await response.text();
	var lines = d3.tsvParse(removeComments(responseText));
	replacementStrings = {};
	for (var i = 0; i < lines.length; i++){
		replacementStrings[lines[i]["id"]] = lines[i]["replacement"];
	}
	//console.log("replacementStrings");
}

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
	masterData = {}
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
	
	var idList = Object.keys(masterData);
	
	for (let y = 0; y < idList.length; y++) {
		masterData[idList[y]]["children"].sort(function(a,b){
			var pA = a["predicate_id"];
			var pB = b["predicate_id"];
			if(pA in rankTypes && pB in rankTypes){
				return rankTypes[pA] - rankTypes[pB]
			}
			else if (pA in rankTypes){
				return -1;
			}
			else if (pB in rankTypes){
				return 1;
			}
			else return 0;
		});
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
	if (data["children"].length > 1){
		cell.setAttribute("rowspan", data["children"].length);
	}
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
	var predText = replaceText(child["predicate_id"]);
	predCell.setAttribute("onclick", "loadDetails(\"" + data["subject_id"] + "\", " + i + ")");
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

function loadDetails(subjectID, index){
	var table = document.getElementById("DetailTable");
	var keys = Object.keys(masterData[subjectID]);
	for (let i = 0; i < keys.length; i++){
		if (keys[i] != "children"){
			var row = table.insertRow(i);
			var left = row.insertCell();
			var leftText = document.createTextNode(keys[i]);
			left.appendChild(leftText);
			var right = row.insertCell();
			var rightText = document.createTextNode(masterData[subjectID][keys[i]]);
			right.appendChild(rightText);
		}
	}
	var offset = keys.length;
	var childKeys = Object.keys(masterData[subjectID]["children"][index]);
	for (let i = 0; i < childKeys.length; i++){
		var row = table.insertRow(i+offset-1);
		var left = row.insertCell();
		var leftText = document.createTextNode(childKeys[i]);
		left.appendChild(leftText);
		var right = row.insertCell();
		var rightText = document.createTextNode(masterData[subjectID]["children"][index][childKeys[i]]);
		right.appendChild(rightText);
	}
	console.log(masterData[subjectID]);
	var holder = document.getElementById("DetailTableHolder");
	holder.style.display = "block";
}

function replaceText(str){
	return (str in replacementStrings) ? replacementStrings[str] : str;
}