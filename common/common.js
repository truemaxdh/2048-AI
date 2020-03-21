/**
 * get random number of normal distribution
 */
function getGaussianRandom(mean, standardDeviation) { 
  let q, u, v, p; 
  do { 
    u = 2.0 * Math.random() - 1.0; 
    v = 2.0 * Math.random() - 1.0; 
    q = u * u + v * v; 
  } while (q >= 1.0 || q === 0); 

  p = Math.sqrt(-2.0 * Math.log(q) / q); 
  return (mean + standardDeviation * u * p); 
}

/**
 * cut off digit under period
 * @param {*} val 
 * @param {*} digitsUnder 
 */
function cutOff(val, digitsUnder) {
  /*
  // do not use temporarily
  digitsUnder || (digitsUnder = 7);
  val = Math.floor(val * Math.pow(10, digitsUnder)) / Math.pow(10, digitsUnder);
  */
  return val;
}

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
 * connect to game
 */
function connectToGame() {
  /*if (!gameMgr) {
    gameMgr = new document.gameFrm.GameManager(
      4,
      document.gameFrm.KeyboardInputManager, 
      document.gameFrm.HTMLActuator, 
      document.gameFrm.LocalStorageManager);
  }
  console.log(gameMgr);*/
  const listeners = (function listAllEventListeners() {
  let elements = [];
  const allElements = document.querySelectorAll('*');
  const types = [];
  for (let ev in window) {
    if (/^on/.test(ev)) types[types.length] = ev;
  }

  for (let i = 0; i < allElements.length; i++) {
    const currentElement = allElements[i];
    for (let j = 0; j < types.length; j++) {
      if (typeof currentElement[types[j]] === 'function') {
        elements.push({
          "node": currentElement,
          "listeners": [ {
            "type": types[j],
            "func": currentElement[types[j]].toString(),
          }]
        });
      }
    }
  }

  return elements.filter(element => element.listeners.length)
})();

console.table(listeners);
}



  
/**
 * ===
 * ETC
 * ===
 */

/**
 * Retrieve input array
 */
function getInputArr() {
  var inputs = [];
  var cells = gameMgr.grid.cells;
  var max = 0;
  for (var x = 0; x < cells.length; x++) {
    var c_x = cells[x];
    for (var y = 0; y < c_x.length; y++) {
      var tile = c_x[y];
      if (tile) {
        var ln2 = Math.log2(tile.value)
        inputs.push(ln2);
        if (max < ln2) {max = ln2};
      } else {
        inputs.push(0);
      }
    }
  }
  for (var i = 0; i < inputs.length; i++) {
    if (!inputs[i]) {
      inputs[i] = 0.00000001;
    } else if (inputs[i] == max) {
      inputs[i] = 0.99999999;
    } else {
      inputs[i] = cutOff(inputs[i] / max, 2);
    }
  }
  return inputs;
}


/**
 * compare two arrays
 * 
 * @param {*} arr1 
 * @param {*} arr2 
 */
function arrCompare(arr1, arr2) {
  if (!arr1 || !arr2) return false;
  if (arr1.length != arr2.length) return false;
  for (var i = 0; i < arr1.length; i++) {
    if (arr1[i] != arr2[i]) return false;
  }
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
  //console.log(dx + "," + dy);
  for (var i = 0; i < _in_arr16.length; i++) {
    if (_in_arr16[i]==0.01) continue;
    var nx = (i / 4 | 0) + dx;
    var ny = (i % 4) + dy;
    if (nx < 0 || nx >= 4 || ny < 0 || ny >= 4) continue;
    var i_new = 4 * nx + ny;
    //console.log(i + ":" + _in_arr16[i] + "->" + i_new + ":" + _in_arr16[i_new]);
    if (_in_arr16[i_new] == 0.00000001 || _in_arr16[i] == _in_arr16[i_new]) {
      b_movable = true;
      break;
    }  
  }

  return b_movable;
}

/**
 * check game out
 * @param {*} inputs 
 */
function isGameOut(inputs) {
  var _dir = 0;
  for (; _dir < 4; _dir++) {
    if (isMovable(inputs, _dir)) break;
  }
  return (_dir == 4);
}

/**
 * Download JSON
 * @param {*} json 
 * @param {*} filename 
 */
function downloadJson(json, filename) {
    var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' +
    encodeURIComponent(JSON.stringify(json)));
  a.setAttribute('download', filename);

  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function normalization(arr) {
  var arr_new = [];
  var min = 99999, max = -99999;
  for (var i = 0; i < arr.length; i++) {
    if (min > arr[i]) min = arr[i];
    if (max < arr[i]) max = arr[i];
  }
  for (var i = 0; i < arr.length; i++) {
    arr_new.push(arr[i] / max);
  }
  return arr_new;
}
