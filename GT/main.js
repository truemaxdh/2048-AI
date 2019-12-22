/**
 * Game manager controller
 */
var gameMgr;
var model = null;
var last_inputs;
var last_outputs;
var lastPredict;
var lastMove;
var b_workaround = true;
var callBack_showStatus, callBack_showPredict;

/**
 * create new weights
 */
function createModel() {
  GT.createModel();
	model = GT.model;
  console.log(GT);
}

/**
 * load weights from json text
 * @param {*} strJson 
 */
function loadModel(jsonPath) {
	console.log(jsonPath);
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
		if (this.status == 200) {
			// SUCCESS
			var strJson = this.responseText;
			var tmp = JSON.parse(strJson);
			GT.loadModel(tmp.model, tmp.trainCnt, tmp.matchCnt, tmp.playCnt, tmp.lastPlayTrainCnt, tmp.lastPlayMatchCnt);
			model = GT.model;
			console.log(GT);
		} else {
			alert("failed to load data");
		}
		}
	}
	xhttp.open("GET", jsonPath, true);
	xhttp.send();
}

function saveModel() {
	downloadJson(GT, "playCnt" + GT.playCnt + ".json");
}


/**
 * predict next step
 */
function predict() {
	lastPredict = -1;
	var _inputs = getInputArr();
	//console.log(_inputs);
	if (isGameOut(_inputs)) {
		return afterGameOut();
	}

	/* if (arrCompare(last_inputs, _inputs)) {
		setTimeout(function() {predict();}, 100);
		return false;
	} */
	
	last_inputs = _inputs;
	for (var lg = 0; lg < model.wt_hi_out[0].length; lg++) {
		console.log(model.wt_hi_out[0][lg]);
	}	
	last_outputs = model.forward(last_inputs);
	console.log(last_outputs);
	var NM_MIN_VALUE = -99999999;
	var top_output = 0;
	
	for (var i = 0; i < last_outputs.length; i++) {
		if (top_output < last_outputs[i]) {
			top_output = last_outputs[i];
			lastPredict = i;
		}
	}

  	//last_inputs = inputs;
  	callBack_showPredict(lastPredict);
  	return true;
}

/**
 * move once at key-press event
 * @param {*} e 
 */
function moveOnce(e) {
	var dir = e.keyCode - 37;
	if (dir < 0 || dir > 3) return false;

	if (isGameOut(last_inputs)) {
		return afterGameOut();
	}

	lastMove = -1;
	if (last_inputs && isMovable(last_inputs, dir)) {
		
		lastMove = dir;
		if (lastPredict == lastMove) {
			GT.matchCnt++;
		}
		
		var E = [];
		for (var i = 0; i < 4; i++) {
			var err = ((lastMove==i)?1:0) - last_outputs[i];
			E.push(err);
		}
		model.backward(E);
		//console.log(model);
		GT.trainCnt++;
		sendKeyEvt(e.keyCode);
		callBack_showStatus(lastMove);
		setTimeout(function() {predict();}, 200);
	}
}

/**
 * action after gameout
 */
function afterGameOut() {
	// GameOver
	console.log("GameOver");
	last_inputs = null;
	GT.playCnt++;
	GT.lastPlayTrainCnt = GT.trainCnt - GT.lastPlayTrainCnt;
	GT.lastPlayMatchCnt = GT.matchCnt - GT.lastPlayMatchCnt;
	saveModel();
	setTimeout(function() {restartGame();}, 500);
	setTimeout(function() {predict();}, 700);
	return false;	
}

function start(_callBack_showStatus, _callBack_showPredict) {
	// link callback functions
	callBack_showStatus = _callBack_showStatus;
	callBack_showPredict = _callBack_showPredict;

	// Add key evt handler
	document.onkeydown = moveOnce;
	
	// Start new game
	restartGame();

	// predict
	setTimeout(function() {predict();}, 200);
}
