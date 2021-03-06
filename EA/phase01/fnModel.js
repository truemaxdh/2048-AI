function fnModel() {
  this.wt_input = [];
  this.wt_hidden = [];
  this.wt_output = [];
  this.initWithBaseWeights = function(wt_base_input, wt_base_hidden, wt_base_output) {
    this.wt_input = wt_base_input.map((x)=>x);
    this.wt_hidden = wt_base_hidden.map((x)=>x);
    this.wt_output = wt_base_output.map((x)=>x);
  };
  this.initWithSizes = function(input_sz, hidden_sz_2d, output_sz) {
    this._fill_wt_rndNums(this.wt_input, 1, input_sz, hidden_sz_2d[1]);
    this._fill_wt_rndNums(this.wt_hidden, hidden_sz_2d[0], hidden_sz_2d[1], hidden_sz_2d[1]);
    this._fill_wt_rndNums(this.wt_output, 1, hidden_sz_2d[1], output_sz);
  };
  this._fill_wt_rndNums = function(wt, layer, row, col) {
    for (var l = 0; l < layer; l++) {
      wt.push([]);
      for (var r = 0; r < row; r++) {
        wt[l].push([]);
        for (var c = 0; c < col; c++) {
          wt[l][r].push(Math.floor((Math.random() * 2.0 - 1.0) * 10000000) / 10000000);
        }
      }
    }
  };
  this.forward = function(inputs) {
    if (inputs.length != this.wt_input[0].length) {
      console.log("input size is incorrect!. The size should be " + 
                  this.wt_input[0].length + ", but it is " + inputs.length);
      return null;
    }
    
    var arr_calc = this._mat_mul(inputs, this.wt_input[0], "ReLU");
    for (var l = 0; l < this.wt_hidden.length; l++) {
      arr_calc = this._mat_mul(arr_calc, this.wt_hidden[l], "ReLU");
    }
    var outputs = this._mat_mul(arr_calc, this.wt_output[0], "");
    return outputs;
  };
  this._mat_mul = function(arr_in, arr_wt, flag_acti) {
    var arr_out = new Array(arr_wt[0].length).fill(0);
    for (var i_in = 0; i_in < arr_in.length; i_in++) {
      for (var i_wt = 0; i_wt < arr_wt[i_in].length; i_wt++) {
        arr_out[i_wt]+=arr_in[i_in] * arr_wt[i_in][i_wt];
      }
    }
    
    // Apply ReLU
    if (flag_acti=="ReLU") {
    	for (var i_out = 0; i_out < arr_out.length; i_out++) {
    		if (arr_out[i_out] < 0) {
    			arr_out[i_out] = 0;
    		}
    	}
    }
    return arr_out;
  };
}
