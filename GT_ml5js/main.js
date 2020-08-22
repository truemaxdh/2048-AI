/**
 * Game manager controller
 */
var gameMgr;
//var model = null;
var GTs = {
  trainCnt : 0,
  matchCnt : 0,
  playCnt : 0,
  lastPlayTrainCnt : 0,
  lastPlayMatchCnt : 0
};

var models = [];
var last_inputs;
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
    task: 'classification', // or 'regression'
    inputs: 16,
    outputs: 4 // Left, Up, Right, Down
  };
  nn = ml5.neuralNetwork(options);
  //console.log("model is created");
  nn.addData([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ['0']);
  nn.addData([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ['1']);
  nn.addData([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ['2']);
  nn.addData([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], ['3']);
  nn.normalizeData();

  nn.train(function() {
    console.log("model is created");
  }); // use the default training options
}

/**
 * load weights from json text
 * @param {*} strJson 
 */
function loadModelJSON(jsonPath) {
  console.log(jsonPath);
  const options = {
    task: 'classification' // or 'regression'
  };
  nn = ml5.neuralNetwork(options);

  nn.load(jsonPath, function() {
    console.log("model is loaded");
  });
}

/**
 * load weights from selected files
 * @param {*} strJson 
 */
function loadModelFiles(files) {
  const options = {
    task: 'classification' // or 'regression'
  }
  nn = ml5.neuralNetwork(options);

  nn.load(files, function() {
    console.log("model is loaded");
    console.log(files[0]);
  });
}
           
function saveModel(model_name) {
  nn.save(model_name, function() {
    console.log("model is saved");
  });
}


/**
 * predict next step
 */
function predict() {
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
  console.log(last_inputs);
  lastPredict = -1;
  nn.classify(last_inputs, function(error, result) {
    console.log(result); 
    if(error){
      console.error(error);
      //return;
    } else {
      last_outputs = result;
      var top_output = 0;
      for (var i = 0; i < result.length; i++) {
        if (top_output < result[i].confidence) {
          top_output = result[i].confidence;
          lastPredict = parseInt(result[i].label);
        }
      }
    }
    
    //last_inputs = inputs;
    callBack_showPredict(lastPredict);
    return true;
  });
  
  
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
      GTs.matchCnt++;
    }
    //while (nn.data.data.raw.length > 1) { nn.data.data.raw.shift(); }
    nn.addData(last_inputs, [lastMove.toString()]);
    try {
      nn.normalizeData();
      /*const trainingOptions={
        batchSize: 24,
        epochs: 32
      }

      nn.train(trainingOptions,finishedTraining); // if you want to change the training options*/
      nn.train(function() {
        GTs.trainCnt++;
        sendKeyEvt(e.keyCode);
        callBack_showStatus(lastMove);
        setTimeout(function() {predict();}, 200);
      }); // use the default training options
    } catch(err) {
      console.log(err)
      GTs.trainCnt++;
      sendKeyEvt(e.keyCode);
      callBack_showStatus(lastMove);
      setTimeout(function() {predict();}, 200);
    }
  }
}

/**
 * action after gameout
 */
function afterGameOut() {
  // GameOver
  console.log("GameOver");
  last_inputs = null;
    
  GTs.playCnt++;
  GTs.lastPlayTrainCnt = GTs.trainCnt - GTs.lastPlayTrainCnt;
  GTs.lastPlayMatchCnt = GTs.matchCnt - GTs.lastPlayMatchCnt;
  saveModel("model_" + GTs.playCnt + "_" + GTs.trainCnt + "_" + GTs.matchCnt + "_" + GTs.lastPlayTrainCnt + "_" + GTs.lastPlayMatchCnt);
  
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
