var masterData;

const columns = ["Subject", "Details", "Object"];

async function fileLines(fileName) {
  const response = await fetch(fileName);
  const responseText = await response.text();

  //Not sure of a better way to filter comments.
  //This works perfectly well for all the data I've seen thusfar
  var lines = responseText.split('\n').filter(checkComment);
  
  //Generate the data table
  var keys = lines[0].split('\t');
  masterData = [];
  for (let y = 1; y < lines.length; y++) {
	var data = lines[y].split('\t');
    var entry = {};
	for (let i = 0; i < keys.length; i++){
		entry[keys[i]] = data[i];
	}
	masterData[y-1] = entry;
  }
  
  //Create table heade
  var table = document.getElementById("MainTable");
  var header = table.createTHead();
  var row = header.insertRow(0);
  for (let i = 0; i < columns.length; i++){
	var cell = row.insertCell();
	var tNode = document.createTextNode(columns[i]);
	cell.appendChild(tNode);
  }
  
  var body = table.createTBody();
  for (let y = 0; y < masterData.length; y++) {
	createRow(body, y, masterData[y]);
  }
}

async function fileLinesComplex(fileName){
  const response = await fetch(fileName);
  const responseText = await response.text();

  //Not sure of a better way to filter comments.
  //This works perfectly well for all the data I've seen thusfar
  var lines = responseText.split('\n').filter(checkComment);
  
  var keys = lines[0].split('\t');
  var masterData = {}
  for (let y = 1; y < lines.length; y++) {
	var dataEntry = lines[y].split('\t');
	var id = null, label = null, entry = {};
	for (let i = 0; i < keys.length; i++){
	  if (keys[i] == "subject_id"){
	    id = dataEntry[i];
	  }
	  else if (keys[i] == "subject_label"){
		label = dataEntry[i];
	  }
	  else{
	    entry[keys[i]] = dataEntry[i];
	  }
	}
	if (masterData[id] == null){
	  masterData[id] = {"subject_id": id, "subject_label": label, "children":[entry]};
	}
	else {
	  masterData[id]["children"].push(entry);
	}
  }
  
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
  for (let y = 0; y < idList.length; y++) {
	createRowComplex(body, y, masterData[idList[y]]);
  }
}

function checkComment(line){
  //This seems to be the standard for comments.
  //If other comment types show up this will be changed
  return line[0] != '#' && line.length != 0;
}

function createRow(p, index, data){
  var row = p.insertRow(index);
  row.setAttribute("onclick", "loadDetails(" + index + ")");
  createCell(row, data, 0, "subject_label", "subject_id");
  createCell(row, data, 30, null, "predicate_id");
  createCell(row, data, 45, "object_label", "object_id");
}

function createRowComplex(p, index, data){
  var row = p.insertRow(index);
  //row.setAttribute("onclick", "loadDetails(" + index + ")");
  createCell(row, data, 0, "subject_label", "subject_id");
  createCellComplex(row, data, 0, null, "predicate_id");
  createCellComplex(row, data, 0, "object_label", "object_id");
}

function createCell(r, data, mChar, primary, secondary){
  var cell = r.insertCell();
  var tText;
  if (data.hasOwnProperty(primary)){
	if (data.hasOwnProperty(secondary)){
	  cell.setAttribute("title", data[secondary]);
	}
	if (data[primary].length > mChar)
	  tText = mChar > 0 ? data[primary].slice(0, mChar) + "..." : data[primary];
    else
	  tText = data[primary];
  }
  else if (data.hasOwnProperty(secondary)) {
	if (data[secondary].length > mChar)
	  tText = data[secondary].slice(0, mChar) + "...";
    else
	  tText = data[secondary];
  }
  else {
	tText = "Data not available";
  }
  var tNode = document.createTextNode(tText);
  cell.appendChild(tNode);
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
	  if (localData[primary].length > mChar)
	    tText = mChar > 0 ? localData[primary].slice(0, mChar) + "..." : localData[primary];
      else
	    tText = localData[primary];
    }
    else if (localData.hasOwnProperty(secondary)) {
	  if (localData[secondary].length > mChar)
	    tText = mChar > 0 ? localData[secondary].slice(0, mChar) + "..." : localData[secondary];
      else
	    tText = localData[secondary];
    }
    else {
	  tText = "Data not available";
    }
  var tNode = document.createTextNode(tText);
  cell.appendChild(tNode);
  }

}

//fileLines("./ncit_icd10_2016.sssom.tsv");
//fileLines("./ncit_icd10_2017.sssom.tsv");
//fileLines("./ordo.sssom.tsv");
//fileLinesComplex("./ordo.sssom.tsv");


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
