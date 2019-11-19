var fnModel = {
  wt_input : [],
  wt_hidden : [],
  wt_output : [],
  initWithBaseWeights : function(wt_base_input, wt_base_hidden, wt_base_output) {
    wt_input = wt_base_input;
    wt_hidden = wt_base_hidden;
    wt_output = wt_base_output;
  },
  initWithSizes : function(input_sz, hidden_sz_2d, output_sz) {
    _fill_wt_rndNums(wt_input, 1, input_sz, hidden_sz_2d[1]);
    _fill_wt_rndNums(wt_hidden, hidden_sz_2d[0], hidden_sz_2d[1], hidden_sz_2d[1]);
    _fill_wt_rndNums(wt_output, 1, hidden_sz_2d[1], output_sz);
  },
  _fill_wt_rndNums : function(wt, layer, row, col) {
    for (var l = 0; l < layer; l++) {
      wt.push([]);
      for (var r = 0; r < row; r++) {
        wt[l].push([]);
        for (var c = 0; c < col; c++) {
          wt[l][r].push(Math.rnd());
        }
      }
    }
  },
  forward : function(inputs) {
    var sz = Math.min(inputs.length, wt_input[0].length);
    
  },
  _mat_mul : function(arr_val, mat_wt) {
    
  }
}
