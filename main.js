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
  return (i_model >= EA.models.length) ? null : EA.models[i_model];	  
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
  //console.log(last_inputs);
  //console.log(inputs);
  
  if (compArrVals(last_inputs, inputs)) {
	  last_inputs = null;
	  return false;
  }
  
  
  var outputs = model.forward(inputs);
  //console.log(outputs);
  lastMove = 0;
  for (var i = 1; i < outputs.length; i++) {
    if (outputs[lastMove] < outputs[i]) {
    	lastMove = i;
    }
  }
  sendKeyEvt(37 + lastMove);
  last_inputs = inputs;
  return true;
}

function proceed1Step(callBack_showStat) {
	  if (!moveOnce()) {
		  model = nextModel();
	  }
	  
	  callBack_showStat();
}

function proceed1Gen(callBack_showStat) {
	  if (i_model < 0) {
		  model = nextModel();
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
	var w = window.open();
	w.document.write(JSON.stringify(json));
}

function evolve() {
	  EA.evolve();
	  i_model = -1;
}

function autoProceed(callBacks) {
	if (i_model < 0) {
		model = nextModel();
	  }
	  proceed1Step(callBacks[0]);
		  
	  if (!model) {
		  // End of one generation
		  // 1. Make Result JSON
		  makeResultJSON();

		  // 2. Show Result
		  callBacks[1]();
		  
		  // 3. Next Generation		  
		  evolve();
	  }
	  setTimeout(autoProceed, 300, callBacks);	
}
