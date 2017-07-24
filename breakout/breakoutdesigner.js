var levelDimensions = [];

var type = 1;
var showGrid = false;
var levelName = "";

var blocks = [];
var redoStack = [];

var context;
var mouseDownPos;

function createContext()
{
	var canvas = document.getElementById("main.focus.canvas");
	return canvas.getContext("2d");
}

/*
	In the interest of efficiency, context should not be created but should
	rather be a variable
*/
function fillScreen(str)
{
	context.rect(0, 0, levelDimensions[0], levelDimensions[1]);
	context.fillStyle = str;
	context.fill();
}

function renderRect(x, y, width, height, str)
{
	context.beginPath();
	context.rect(x, y, width, height);
	context.fillStyle = str;
	context.fill();
	context.closePath();
}

function renderType(x, y, n)
{
	//	These conditions can be collapsed into a bitshift command
	if(n == 1)
	{
		renderRect(x, y, levelDimensions[2], levelDimensions[3], "#FF0000");
		renderRect(x + 4, y + 4, levelDimensions[2] - 8, levelDimensions[3] - 8, "#880000");
	}

	if(n == 2)
	{
		renderRect(x, y, levelDimensions[2], levelDimensions[3], "#00FF00");
		renderRect(x + 4, y + 4, levelDimensions[2] - 8, levelDimensions[3] - 8, "#008800");
	}

	if(n == 3)
	{
		renderRect(x, y, levelDimensions[2], levelDimensions[3], "#0000FF");
		renderRect(x + 4, y + 4, levelDimensions[2] - 8, levelDimensions[3] - 8, "#000088");
	}
}

function renderGrid()
{
	for(var i = 0; i < levelDimensions[0]; i += levelDimensions[2])
	{
		context.beginPath();
		context.moveTo(i, 0);
		context.lineTo(i, levelDimensions[1]);
		context.strokeStyle = "#000000";
		context.stroke();
	}

	for(var i = 0; i < levelDimensions[1]; i += levelDimensions[3])
	{
		context.beginPath();
		context.moveTo(0, i);
		context.lineTo(levelDimensions[0], i);
		context.strokeStyle = "#000000";
		context.stroke();
	}
}

function render()
{
	fillScreen("#FFFFFF");

	if(showGrid)
	{
		renderGrid();
	}

	for(var i = 0; i < blocks.length; ++i)
	{
		renderType(blocks[i].x, blocks[i].y, blocks[i].type);
	}
}

function changeButtonColor()
{
	$("#main\\.focus\\.typeone").attr("class", "");
	$("#main\\.focus\\.typetwo").attr("class", "");
	$("#main\\.focus\\.typethree").attr("class", "");
}

function typeOne()
{
	console.log("Type one was clicked");
	type = 1;

	changeButtonColor();
	$("#main\\.focus\\.typeone").attr("class", "selected");
}

function typeTwo()
{
	console.log("Type two was clicked");
	type = 2;

	changeButtonColor();
	$("#main\\.focus\\.typetwo").attr("class", "selected");
}

function typeThree()
{
	console.log("Type three was clicked");
	type = 3;

	changeButtonColor();
	$("#main\\.focus\\.typethree").attr("class", "selected");
}

function normalizePosition(x, y)
{
	x = Math.floor(x / levelDimensions[2]) * levelDimensions[2];
	y = Math.floor(y / levelDimensions[3]) * levelDimensions[3];

	return {"x": x, "y": y};
}

function getIndexByXY(array, x, y)
{
	//	A k-d Tree might be useful for this, but the domain is so small that it
	//	isn't really worth it.
	for(var i = 0; i < array.length; ++i)
	{
		if(array[i].x == x && array[i].y == y)
		{
			return i;
		}
	}

	return -1;
}

function locationFilled(x, y)
{
	if(getIndexByXY(blocks, x, y) != -1)
	{
		console.log("Colision between block to be added and existing block");
		return true;
	}

	return false;
}

function updateLiId()
{
	var list = $("#main\\.sidebarleft\\.panel\\.list").children();

	for(var i = 0; i < list.length; ++i)
	{
		var x = list[i].children[1].value;
		var y = list[i].children[2].value;

		list[i].id = i;
	}
}

function updateLi()
{
	console.log("Update");

	//	Create new block
	var children = $(this).parent().children();
	var type = children[0].value;
	var x = children[1].value;
	var y = children[2].value;

	var position = normalizePosition(x, y);
	x = position.x;
	y = position.y;

	if(getIndexByXY(x, y) != -1)
	{
		console.log("Collision");
		return;
	}

	var parent = $(this).parent();
	var id = parent.attr("id");

	console.log(type);
	blocks[id].type = type;
	blocks[id].x = x;
	blocks[id].y = y;
}

function delLi(block)
{
	console.log("Delete");

	if(block.x !== undefined)
	{
		var list = $("#main\\.sidebarleft\\.panel\\.list").children();

		//	Once again, it's probably just easier to use DOM here instead of
		//	casting back to JQuery or similar
		for(var i = 0; i < list.length; ++i)
		{
			var x = list[i].children[1].value;
			var y = list[i].children[2].value;
			if(block.x == x && block.y == y)
			{
				list[i].parentNode.removeChild(list[i]);
			}
		}
		return;
	}

	var parent = $(this).parent();

	//	x.value is not JQuery, it's DOM
	var x = parent.children()[1].value;
	var y = parent.children()[2].value;
	var index = getIndexByXY(blocks, x, y);

	redoStack.push(blocks[index]);
	blocks.splice(index, 1);

	parent.remove();
	updateLiId();
}

function createPanelElement(block)
{
	var li = $("<li id='" + String(getIndexByXY(blocks, block.x, block.y) + "'>"));
	li.append("Type: ");
	li.append("<input type='text' name='type' maxlength='1' size='1' value='" + String(block.type) + "'></input>");
	li.append("Horizontal: ");
	li.append("<input type='text' name='x' maxlength='3' size='4' value='" + String(block.x) + "'></input>");
	li.append("Vertical: ");
	li.append("<input type='text' name='y' maxlength='3' size='4' value='" + String(block.y) + "'></input>");
	li.append("<br>");

	var update = $("<input type='button' value='Update'/>");
	var del = $("<input type='button' value='Delete'/>");
	update.click(updateLi);
	del.click(delLi);

	li.append(update);
	li.append(del);

	$("#main\\.sidebarleft\\.panel\\.list").append(li);
}

function canvasMouseDown(evt)
{
	console.log("Mouse down event");

	var canvas = document.getElementById("main.focus.canvas");
	var x = evt.pageX - canvas.offsetLeft;
	var y = evt.pageY - canvas.offsetTop;
	var hits = type;

	if(hits == 3)
	{
		hits = -1;
	}

	var position = normalizePosition(x, y);
	x = position.x;
	y = position.y;

	mouseDownPos = position;

	if(locationFilled(x, y))
	{
		return;
	}

	blocks.push({"type": type, "hits": hits, "x": x, "y": y});
	redoStack = [];
	createPanelElement(blocks[blocks.length - 1]);
	console.log(blocks[blocks.length - 1]);
}

/*
	Should really abstract some of this logic into a "fill position" function or similar`
	Similarly, the array "push" function should be abstracted to check for collision as well
*/
function canvasMouseUp(evt)
{
	//console.log("Mouse up event");

	var canvas = document.getElementById("main.focus.canvas");
	var x = evt.pageX - canvas.offsetLeft;
	var y = evt.pageY - canvas.offsetTop;
	var hits = type;

	if(hits == 3)
	{
		hits = -1;
	}

	var position = normalizePosition(x, y);
	x = position.x;
	y = position.y;

	if(locationFilled(x, y))
	{
		return;
	}

	var col = mouseDownPos.x;
	var row = mouseDownPos.y;

	//	Currently the only gesture that is recognized is upper left corner to lower right.
	//	Inequalities are intentionally OBOE.
	while(col <= x)
	{
		row = mouseDownPos.y;
		while(row < y)
		{
			if(!locationFilled(col, row))
			{
				blocks.push({"type": type, "hits": hits, "x": col, "y": row});
				createPanelElement(blocks[blocks.length - 1]);
				console.log(blocks[blocks.length - 1]);
			}

			row += levelDimensions[3]
		}

		if(!locationFilled(col, row))
		{
			blocks.push({"type": type, "hits": hits, "x": col, "y": row});
			createPanelElement(blocks[blocks.length - 1]);
			console.log(blocks[blocks.length - 1]);
		}

		col += levelDimensions[2];
	}
}

//	Note that this function does not actually look at the value of the checkbox,
//	it only toggles a bool true and false
function toggleGrid()
{
	console.log("Show Grid: " + !showGrid);
	showGrid = !showGrid;
}

function undo()
{
	if(blocks.length === 0)
	{
		return;
	}

	console.log("Undo button was pressed");
	delLi(blocks[blocks.length - 1]);
	redoStack.push(blocks[blocks.length - 1]);
	blocks.splice(blocks.length - 1);
}

function redo()
{
	if(redoStack.length === 0)
	{
		return;
	}

	console.log("Redo button was pressed");
	blocks.push(redoStack[redoStack.length - 1]);
	createPanelElement(redoStack[redoStack.length - 1]);
	redoStack.splice(redoStack.length - 1);
}

function downloadLevel(evt)
{
	console.log("Downloading");

	var str = "";

	var element = document.createElement('a');

	//	This needs to be adjusted so that the array ha
	var levelData = [];
	levelData.push({"dimensions": levelDimensions});
	levelData.push({"blocks": blocks});
	//levelData = levelData.concat(blocks);

	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(levelData)));
	element.setAttribute('download', levelName + ".txt");

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);

	evt.preventDefault();
}

function setLevelName()
{
	levelName = $("#main\\.top\\.name").val();
}

function updateValues(evt)
{
	console.log("Update was pressed");

	var updatedVariables = []

	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.screenwidth").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.screenheight").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.blockwidth").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.blockheight").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.paddlewidth").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.paddleheight").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.speed").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.xv").val());
	updatedVariables.push($("#main\\.sidebarright\\.form\\.field\\.yv").val());

	for(var i = 0; i < updatedVariables.length; ++i)
	{
		if(updatedVariables[i] != "" && !isNaN(updatedVariables[i]))
		{
			console.log(updatedVariables[i]);
			levelDimensions[i] = updatedVariables[i];
		}
	}

	evt.preventDefault();
}

//	Note that currently there is no validation for errata in the level file
function upload(evt)
{
	var file = this.files[0];

	levelName = file.name.substring(0, file.name.length - 4);
	$("#main\\.top\\.name").val(levelName);

	var reader = new FileReader();
		reader.onload = function(progressEvent){

		var info = JSON.parse(this.result);

		var newDimensions = info[0].dimensions;

		for(var i = 0; i < newDimensions; ++i)
		{
			levelDimensions[i] = newDimensions[i];
		}

		blocks = [];
		for(var i = 1; i < info.length; ++i)
		{
			var block = {};
			block.type = info[i].type;
			block.hits = info[i].hits;
			block.x = info[i].x;
			block.y = info[i].y;

			blocks.push(block);
		}
	};

	reader.readAsText(file);
}

window.onload = function(){
	console.log("Javascript file loaded correctly");
	context = document.getElementById("main.focus.canvas").getContext("2d");

	levelDimensions.push(600);	//	0 canvasWidth
	levelDimensions.push(600);	//	1 canvasHeight
	levelDimensions.push(40);	//	2 blockWidth
	levelDimensions.push(20);	//	3 blockHeight
	levelDimensions.push(80);	//	4 paddleWidth
	levelDimensions.push(20);	//	5 paddleHeight
	levelDimensions.push(4);	//	6 paddleSpeed
	levelDimensions.push(5);	//	7 ballXV
	levelDimensions.push(7);	//	8 ballYV

	typeOne();
	setLevelName();

	//	Instead of setting an interval and rewriting the same pixels with the
	//	same color, it might be better to write a "should change function"
	timer = setInterval(render, 100);
	$("#main\\.top\\.button").click(setLevelName);
	$("#main\\.sidebarleft\\.grid").click(toggleGrid);
	$("#main\\.sidebarleft\\.undo").click(undo);
	$("#main\\.sidebarleft\\.redo").click(redo);
	$("#main\\.focus\\.typeone").click(typeOne);
	$("#main\\.focus\\.typetwo").click(typeTwo);
	$("#main\\.focus\\.typethree").click(typeThree);
	$("#main\\.focus\\.download").click(downloadLevel);
	$("#main\\.focus\\.canvas").mousedown(canvasMouseDown);
	$("#main\\.focus\\.canvas").mouseup(canvasMouseUp);
	$("#main\\.focus\\.upload").change(upload);
	$("#main\\.sidebarright\\.form").submit(updateValues);
};


//	TODO:
//	Grid breaks when changing block dimensions. Screen resize not implemented
//
//
