const columns = ["Subject", "Details", "Object"];


async function fileLines(fileName) {
  const response = await fetch(fileName);
  const responseText = await response.text();

  //Not sure of a better way to filter comments.
  //This works perfectly well for all the data I've seen thusfar
  var lines = responseText.split('\n').filter(checkComment);
  
  //Generate the data table
  var keys = lines[0].split('\t');
  var masterTable = [];
  for (let y = 1; y < lines.length; y++) {
	var data = lines[y].split('\t');
    var entry = {};
	for (let i = 0; i < keys.length; i++){
		entry[keys[i]] = data[i];
	}
	masterTable[y-1] = entry;
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
  for (let y = 0; y < masterTable.length; y++) {
	createRow(body, y, masterTable[y]);
  }
}

function checkComment(line){
  //This seems to be the standard for comments.
  //If other comment types show up this will be changed
  return line[0] != '#' && line.length != 0;
}

function createRow(p, index, data){
  var row = p.insertRow(index);
  createCell(row, data, 45, "subject_label", "subject_id");
  createCell(row, data, 30, null, "predicate_id");
  createCell(row, data, 45, "object_label", "object_id");
}

function createCell(r, data, mChar, primary, secondary){
  var cell = r.insertCell();
  var tText;
  if (data.hasOwnProperty(primary)){
	if (data.hasOwnProperty(secondary)){
	  cell.setAttribute("title", data[secondary]);
	}
	if (data[primary].length > mChar)
	  tText = data[primary].slice(0, mChar) + "...";
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


function unloadDetails(){
  var table = document.getElementById("DetailTable");
  table.style.display = "none";
}

function loadDetails(){
  var table = document.getElementById("DetailTable");
  table.style.display = "block";
}
fileLines("./ncit_icd10_2017.sssom.tsv");
