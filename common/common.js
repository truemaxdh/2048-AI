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
	for (var x = 0; x < cells.length; x++) {
		var c_x = cells[x];
		for (var y = 0; y < c_x.length; y++) {
			var tile = c_x[y];
			if (tile) {
				inputs.push(Math.log2(tile.value));
			} else {
				inputs.push(0);
			}
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