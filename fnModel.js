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
    if (inputs.length != wt_input[0].length) {
      console.log("input size is incorrect!. The size should be " + 
                  wt_input[0].length + ", but it is " + inputs.length);
      return null;
    }
    
    var arr_calc = _mat_mul(inputs, wt_input[0]);
    for (var l = 0; l < wt_hidden.length; l++) {
      arr_calc = _mat_mul(arr_calc, wt_hidden[l]);
    }
    var outputs = _mat_mul(arr_calc, wt_output[0]);
    return outputs;
  },
  _mat_mul : function(arr_in, arr_wt) {
    var arr_out = new Array(arr_wt.length).fill(0);
    for (var i_in = 0; i_in < arr_in.length; i_in++) {
      for (var i_wt = 0; i_wt < arr_wt.length; i_wt++) {
        arr_out[i_wt]+=arr_in[i_in] * arr_wt[i_in][i_wt];
      }
    }
    return arr_out;
  }
}
