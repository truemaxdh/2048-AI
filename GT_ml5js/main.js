/**
 * Game manager controller
 */
var gameMgr;
//var model = null;
var GTs = [];
var models = [];
var last_inputs;
var last_outputs;
var lastPredict;
var lastMove;
var b_workaround = true;
var callBack_showStatus, callBack_showPredict;

var nn;

/**
 * create new weights
 */
function createModel() {
  const options = {
    task: 'classification' // or 'regression'
    inputs: 16,
    outputs: 4 // Left, Up, Right, Down
  }
  nn = ml5.neuralNetwork(options)
}

/**
 * load weights from json text
 * @param {*} strJson 
 */
function loadModel(jsonPath) {
  console.log(jsonPath);
  const options = {
    task: 'classification' // or 'regression'
  }
  nn = ml5.neuralNetwork(options);

  nn.load(jsonPath, function() {
    console.log("model is loaded");
  });
}

function saveModel(_gt) {
  nn.save(, function() {
    console.log("model is saved");
  });
}


/**
 * predict next step
 */
function predict() {
  lastPredict = [];
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
  last_outputs = [];
  for (var modelId = 0; modelId < models.length; modelId++) {
    lastPredict.push(-1);
    /* for (var lg = 0; lg < models[modelId].wt_hi_out[0].length; lg++) {
      console.log(models[modelId].wt_hi_out[0][lg]);
    } */  
    last_outputs.push(models[modelId].forward(last_inputs));
    console.log(last_outputs[modelId]);
    var NM_MIN_VALUE = -99999999;
    var top_output = 0;
    
    for (var i = 0; i < last_outputs[modelId].length; i++) {
      if (top_output < last_outputs[modelId][i]) {
        top_output = last_outputs[modelId][i];
        lastPredict[modelId] = i;
      }
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

  lastMove = [];
  if (last_inputs && isMovable(last_inputs, dir)) {
    
    lastMove = dir;
    for (var modelId = 0; modelId < models.length; modelId++) {
      if (lastPredict[modelId] == lastMove) {
        GTs[modelId].matchCnt++;
      }
      var E = [];
      for (var i = 0; i < 4; i++) {
        var err = ((lastMove==i)?1:0) - last_outputs[modelId][i];
        E.push(err);
      }
      models[modelId].backward(E);
      //console.log(model);
      GTs[modelId].trainCnt++;
    }
    
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
  
  for (var modelId = 0; modelId < models.length; modelId++) {
    GTs[modelId].playCnt++;
    GTs[modelId].lastPlayTrainCnt = GTs[modelId].trainCnt - GT.lastPlayTrainCnt;
    GTs[modelId].lastPlayMatchCnt = GTs[modelId].matchCnt - GT.lastPlayMatchCnt;
    saveModel(GTs[modelId]);
    
  }
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
