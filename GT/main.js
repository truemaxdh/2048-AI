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
function loadModel(strJson) {
	var tmp = JSON.parse(strJson);
	GT.loadModel(tmp.model, tmp.trainCnt, tmp.matchCnt, tmp.playCnt, tmp.lastPlayTrainCnt, tmp.lastPlayMatchCnt);
	model = GT.model;
	console.log(GT);
}

function saveModel() {
	downloadJson(GT, "guided_" + GT.lastPlayTrainCnt + "_" + GT.lastPlayMatchCnt + ".json");
}


/**
 * predict next step
 */
function predict() {
	lastPredict = -1;
	last_inputs = getInputArr();
	var _dir = 0;
	for (; _dir < 4; _dir++) {
		if (isMovable(last_inputs, _dir)) break;
	}
	console.log(_dir);
	if (_dir == 4) {
		// GameOver
		console.log("GameOver");
		last_inputs = null;
		GT.playCnt++;
		GT.lastPlayTrainCnt = GT.trainCnt - GT.lastPlayTrainCnt;
		GT.lastPlayMatchCnt = GT.matchCnt - GT.lastPlayMatchCnt;
		console.log("GameOver");
		saveModel();
		console.log("GameOver");
		setTimeout(function() {restartGame();}, 500);
		setTimeout(function() {predict();}, 700);
		console.log("GameOver");
		return false;	
	}

	last_outputs = model.forward(last_inputs);
	//console.log(last_outputs);
	var NM_MIN_VALUE = -99999999;
	var top_output = NM_MIN_VALUE;
	
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


function autoProceed(callBacks, _mutation_ratio, ck_wkar) {
	if (i_model < 0) {
		nextModel();
	  }
	  proceed1Step(callBacks[0]);
		  
	  if (!model) {
		  // End of one generation
		  // 1. Make Result JSON
		  makeResultJSON();

		  // 2. Show Result
		  callBacks[1]();
		  
		  // 3. Next Generation
		  if (EA.generationId == 99) return;
		  evolve(_mutation_ratio);
	  }
	  setTimeout(autoProceed, 300, callBacks);	
}
