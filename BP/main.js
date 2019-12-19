/**
 * ===================================
 * Button and Keyboard Event Generator
 * ===================================
 */

 /**
  * restart game
  */
function restartGame() {
  var btn = document.gameFrm.document.getElementsByClassName("restart-button")[0];
  btn.click();
}


/**
 * send key event to game
 * - Left: 37 - Up: 38 - Right: 39 - Down: 40
 * @param {*} keyCode 
 */
function sendKeyEvt(keyCode) {
  document.gameFrm.document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':keyCode}));
}

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
 * connect to game
 */
function connectToGame() {
  if (!gameMgr) {
    gameMgr = new document.gameFrm.GameManager(
        4,
        document.gameFrm.KeyboardInputManager, 
        document.gameFrm.HTMLActuator, 
        document.gameFrm.LocalStorageManager);
    }
  console.log(gameMgr);
}

/**
 * create new weights
 */
function createModel() {
  BP.createModel();
	model = BP.model;
  console.log(BP);
}

/**
 * load weights from json text
 * @param {*} strJson 
 */
function loadModel(strJson) {
	var tmp = JSON.parse(strJson);
	BP.loadModel(tmp.model, tmp.trainCnt, tmp.matchCnt);
	model = BP.model;
	console.log(BP);
}

/**
 * compare two arrays
 * 
 * @param {*} arr1 
 * @param {*} arr2 
 */
function compArrVals(arr1, arr2) {
	if (!arr1 || !arr2) return false;
	if (arr1.length != arr2.length) return false;
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] != arr2[i]) return false;
	}
	return true;
}

/**
 * get input array, and check if game is over
 */
function getInputArr() {
	var inputs = [];
	var cells = gameMgr.grid.cells;
	var bGameover = true;
	for (var x = 0; x < cells.length; x++) {
		var c_x = cells[x];
		for (var y = 0; y < c_x.length; y++) {
			var tile = c_x[y];
			if (tile) {
				inputs.push(Math.log2(tile.value));
			} else {
				inputs.push(0);
				bGameover = false;
			}
		}
	}

	if (bGameover) {
		inputs = null;
	}
	return inputs;
}


/**
 * predict next step
 */
function predict() {
	lastPredict = -1;
	var inputs = getInputArr();
	if (!inputs) {
		// GameOver
		last_inputs = null;
		BP.playCnt++;
		BP.lastPlayTrainCnt = BP.trainCnt - BP.lastPlayTrainCnt;
		BP.lastPlayMatchCnt = BP.matchCnt - BP.lastPlayMatchCnt;

		setTimeout(function() {restartGame();}, 500);
		setTimeout(function() {predict();}, 700);
		return false;	
	}

	last_outputs = model.forward(inputs);
	console.log(last_outputs);
	var NM_MIN_VALUE = -99999999;
	var top_output = NM_MIN_VALUE;
	
	for (var i = 0; i < last_outputs.length; i++) {
		if (top_output < last_outputs[i]) {
			top_output = last_outputs[i];
			lastPredict = i;
		}
	}

  	last_inputs = inputs;
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
			BP.matchCnt++;
		}
		
		var E = [];
		for (var i = 0; i < 4; i++) {
			var err = ((lastMove==i)?1:0) - last_outputs[i];
			E.push(err);
		}
		model.backward(E);
		console.log(model);
		BP.trainCnt++;
		sendKeyEvt(e.keyCode);
		callBack_showStatus(lastMove);
		setTimeout(function() {predict();}, 200);
	}
}


/**
 * Check if able to move 
 * @param {*} _in_arr16 
 * @param {*} _dir : 0 - L, 1 - U, 2 - R, 3 - D 
 */
function isMovable(_in_arr16, _dir) {
	var dx = (_dir - 1) % 2;
	var dy = (_dir - 2) % 2;
	var b_movable = false;
	//console.log(dx + "," + dy);
	for (var i = 0; i < _in_arr16.length; i++) {
		if (!_in_arr16[i]) continue;
		var nx = (i / 4 | 0) + dx;
		var ny = (i % 4) + dy;
		if (nx < 0 || nx >= 4 || ny < 0 || ny >= 4) continue;
		var i_new = 4 * nx + ny;
		//console.log(i + ":" + _in_arr16[i] + "->" + i_new + ":" + _in_arr16[i_new]);
		if (!_in_arr16[i_new] || _in_arr16[i] == _in_arr16[i_new]) {
			b_movable = true;
			break;
		}	
	}

	return b_movable;
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
