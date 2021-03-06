/**
 * Game manager controller
 */
var gameMgr;
var model = null;
var last_inputs;
var last_outputs;
var lastMove;
var b_workaround = true;
var callBack_showStatus, callBack_showPredict;


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

			model = new fnModel();
			if (tmp.model.wt_input) {
				model.initWithBaseWeights(tmp.model.wt_input, tmp.model.wt_hidden, tmp.model.wt_output);
			} else {
				model.initWithBaseWeights(tmp.model.wt_in_hi, tmp.model.wt_hi_hi, tmp.model.wt_hi_out);
			}
			
			console.log(model);
		} else {
			alert("failed to load data");
		}
		}
	}
	xhttp.open("GET", jsonPath, true);
	xhttp.send();
	
}


/**
 * predict and move
 */
function predictAndMove() {
	lastMove = -1;
	last_inputs = getInputArr();

	last_outputs = model.forward(last_inputs);
	//console.log(last_outputs);
	var NM_MIN_VALUE = -99999999;
	var top_output = NM_MIN_VALUE;
	
	var i = 0;
	for (; i < last_outputs.length; i++) {
		if (top_output < last_outputs[i] && isMovable(last_inputs, i)) {
			top_output = last_outputs[i];
			lastMove = i;
		}
	}
	console.log(last_outputs);
	
	if (lastMove == -1) {
		// GameOver
		return false;	
	}
	sendKeyEvt(37 + lastMove);
	callBack_showStatus(lastMove);
	setTimeout(function() {predictAndMove();}, 300);
}


function start(_callBack_showStatus) {
	// link callback functions
	callBack_showStatus = _callBack_showStatus;
	
	// Start new game
	restartGame();
	
	// start predict and move
	setTimeout(function() {predictAndMove();}, 200);
}
