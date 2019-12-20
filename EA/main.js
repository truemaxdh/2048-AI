/**
 * Game manager controller
 */
var gameMgr;
var model = null;
var i_model = -1;
var last_inputs;
var lastMove;
var b_workaround = true;
var moveCnt = 0;
var lossCnt = 0;

function toggle_wkar(_t_f) {
	b_workaround=_t_f;
}


function createFirstGeneration(_modelNum) {
	if (!_modelNum) _modelNum = 30;
  EA.createModels(_modelNum);
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
  moveCnt = 0;
  lossCnt = 0;
  model = (i_model >= EA.models.length) ? null : EA.models[i_model];	  
}


function moveOnce() {
	lastMove = -1;
  var inputs = getInputArr();
  
  if (arrCompare(last_inputs, inputs)) {
	  //console.log(last_inputs);
	  //console.log(inputs);
	  //console.log("go to next model");
	  last_inputs = null;
	  return false;
  }
  
  
  var outputs = model.forward(inputs);
  console.log(outputs);

  var NM_MIN_VALUE = -99999999;
  lastMove = -1;
  var trialCnt = b_workaround ? 4:1;
  var t = 0;
  for (; t < trialCnt; t++) {
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
	  moveCnt++;
	  (t > 0) && lossCnt++;
	  sendKeyEvt(37 + lastMove);
  }
  last_inputs = inputs;
  return true;
}


function proceed1Step(callBack_showStat) {
	  if (!moveOnce()) {
		  EA.scores[i_model] -= Math.floor(EA.scores[i_model] / moveCnt * lossCnt);
		  nextModel();
	  }
	  setTimeout(function() {
		  EA.scores[i_model] = gameMgr.score;
		  callBack_showStat();
	  }, 200);
}

function proceed1Gen(callBack_showStat) {
	  if (i_model < 0) {
		  EA.scores[i_model] -= Math.floor(EA.scores[i_model] / moveCnt * lossCnt);
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
		return cutOff(tot / EA.scores.length);
	})();
	var json = {
			title:'gen' + EA.generationId + '_top' + EA.scores[0] + '_avg' + avg,
			generation:EA.generationId,
			topScore:EA.scores[0],
			avgScore:avg,
			models: EA.models,
			scores : EA.scores
	};
	
	downloadJson(json, json.title + ".json");
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
