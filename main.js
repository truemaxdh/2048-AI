/**
 * Button and Keyboard Event Generator
 */
function restartGame() {
  var btn = document.gameFrm.document.getElementsByClassName("restart-button")[0];
  btn.click();
}

// - Left: 37 - Up: 38 - Right: 39 - Down: 40
function sendKeyEvt(keyCode) {
  document.gameFrm.document.dispatchEvent(new KeyboardEvent('keydown',{'keyCode':keyCode}));
}

/**
 * Game manager controller
 */
var gameMgr;
var model = null;
var i_model = -1;
var last_inputs;
var lastMove;
var b_workaround = true;

function toggle_wkar(_t_f) {
	b_workaround=_t_f;
}

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


function createFirstGeneration() {
  EA.createModels(100);
  console.log(EA);
}

function loadGeneration(strJson) {
	var tmp = JSON.parse(strJson);
	EA.generationId = tmp.generation;
	EA.loadModels(tmp.models, tmp.scores);
	console.log(EA);
}

function nextModel() {
  restartGame();
  i_model++;
  model = (i_model >= EA.models.length) ? null : EA.models[i_model];	  
}

function compArrVals(arr1, arr2) {
	if (!arr1 || !arr2) return false;
	if (arr1.length != arr2.length) return false;
	for (var i = 0; i < arr1.length; i++) {
		if (arr1[i] != arr2[i]) return false;
	}
	return true;
}

function moveOnce() {
	lastMove = -1;
  var inputs = [];
  var cells = gameMgr.grid.cells;
  for (var x = 0; x < cells.length; x++) {
    var c_x = cells[x];
    for (var y = 0; y < c_x.length; y++) {
      var tile = c_x[y];
      if (tile) {
        inputs.push(tile.value);
      } else {
        inputs.push(0);
      }
    }
  }
  
  if (compArrVals(last_inputs, inputs)) {
	  console.log(last_inputs);
	  console.log(inputs);
	  alert("go to next model");
	  last_inputs = null;
	  return false;
  }
  
  
  var outputs = model.forward(inputs);
  //console.log(outputs);

  var NM_MIN_VALUE = -99999999;
  lastMove = -1;
  var trialCnt = b_workaround ? 4:1;
  for (var t = 0; t < trialCnt; t++) {
	var top_output = NM_MIN_VALUE;
	var move = -1;
	for (var i = 0; i < outputs.length; i++) {
		if (top_output < outputs[i]) {
			top_output = outputs[i];
			move = i;
		}
	}
	if (isMovable(inputs, move)) {
		lastMove = move;
		break;
	}
	outputs[move] = NM_MIN_VALUE;
  }
  
  if (lastMove >= 0) {
	sendKeyEvt(37 + lastMove);
  }
  last_inputs = inputs;
  return true;
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
	console.log(dx + "," + dy);
	for (var i = 0; i < _in_arr16.length; i++) {
		if (!_in_arr16[i]) continue;
		var nx = i / 4 | 0 + dx;
		var ny = i % 4 + dy;
		if (nx < 0 || nx >= 4 || ny < 0 || ny >= 4) continue;
		var i_new = 4 * nx + ny;
		console.log(i + ":" + _in_arr16[i] + "->" + i_new + ":" + _in_arr16[i_new]);
		if (!_in_arr16[i_new] || _in_arr16[i] == _in_arr16[i_new]) {
			b_movable = true;
			break;
		}	
	}

	return b_movable;
}

function proceed1Step(callBack_showStat) {
	  if (!moveOnce()) {
		  nextModel();
	  }
	  
	  callBack_showStat();
}

function proceed1Gen(callBack_showStat) {
	  if (i_model < 0) {
		  nextModel();
	  }
	  proceed1Step(callBack_showStat);
		  
	  if (!model) return;
	  setTimeout(proceed1Gen, 300, callBack_showStat);
}

function makeResultJSON() {
	EA.sortByScore();
	var avg = (function() {
		var tot = 0;
		for (var i = 0; i < EA.scores.length;i++) {
			tot += EA.scores[i];
		}
		return (tot / EA.scores.length);
	})();
	var json = {
			title:'gen' + EA.generationId + '_top' + EA.scores[0] + '_avg' + avg,
			generation:EA.generationId,
			topScore:EA.scores[0],
			avgScore:avg,
			models: EA.models,
			scores : EA.scores
	};
	
	var a = document.createElement('a');
	a.setAttribute('href', 'data:text/plain;charset=utf-8,' +
		encodeURIComponent(JSON.stringify(json)));
	a.setAttribute('download', json.title + ".json");

	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function evolve() {
	  EA.evolve();
	  i_model = -1;
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
