function fnModel() {
  this.wt_in_hi = [];
  this.wt_hi_hi = [];
  this.wt_hi_out = [];
  this.i_hid = [];
  this.i_out = [];
  this.learningRate = 0.01;
  this.initWithBaseWeights = function(wt_base_in_hi, wt_base_hi_hi, wt_base_hi_out) {
    this.wt_in_hi = wt_base_in_hi.map((x)=>x);
    this.wt_hi_hi = wt_base_hi_hi.map((x)=>x);
    this.wt_hi_out = wt_base_hi_out.map((x)=>x);
  };
  this.initWithSizes = function(input_sz, hidden_sz_2d, output_sz) {
    this._fill_wt_rndNums(this.wt_in_hi, 1, input_sz, hidden_sz_2d[1]);
    this._fill_wt_rndNums(this.wt_hi_hi, hidden_sz_2d[0], hidden_sz_2d[1], hidden_sz_2d[1]);
    this._fill_wt_rndNums(this.wt_hi_out, 1, hidden_sz_2d[1], output_sz);
  };
  this._fill_wt_rndNums = function(wt, layer, row, col) {
    var range = 1 / Math.sqrt(row);
    for (var l = 0; l < layer; l++) {
      wt.push([]);
      for (var r = 0; r < row; r++) {
        wt[l].push([]);
        for (var c = 0; c < col; c++) {
          wt[l][r].push(cutOff(Math.random() * range) + 0.0000001);
        }
      }
    }
  };
  this.forward = function(inputs) {
    if (inputs.length != this.wt_in_hi[0].length) {
      console.log("input size is incorrect!. The size should be " + 
                  this.wt_in_hi[0].length + ", but it is " + inputs.length);
      return null;
    }
    
    this.i_hid = [];
    this.i_out = [];
    var arr_calc = this._mat_mul(inputs, this.wt_in_hi[0]);
    this.i_hid.push(arr_calc);
    arr_calc = this._ReLU(arr_calc);
    for (var l = 0; l < this.wt_hi_hi.length; l++) {
      arr_calc = this._mat_mul(arr_calc, this.wt_hi_hi[l]);
      this.i_hid.push(arr_calc);
      arr_calc = this._ReLU(arr_calc);  
    }
    arr_calc = this._mat_mul(arr_calc, this.wt_hi_out[0]);
    this.i_out.push(arr_calc);
    arr_calc = this._ReLU(arr_calc);
    return arr_calc;
  };
  this._mat_mul = function(arr_in, arr_wt) {
    var arr_out = new Array(arr_wt[0].length).fill(0);
    for (var i_in = 0; i_in < arr_in.length; i_in++) {
      for (var i_wt = 0; i_wt < arr_wt[i_in].length; i_wt++) {
        arr_out[i_wt]+=arr_in[i_in] * arr_wt[i_in][i_wt];
      }
    }
    return arr_out;
  };
  this._ReLU = function(arr) {
    var arr_out = [];
    // Apply ReLU
    for (var i = 0; i < arr.length; i++) {
      arr_out.push((arr[i] > 0) ? arr[i] : 0);
    }
  
    return arr_out;
  }
  this.backward = function(E) {
    var E_new = this._back1stepErr(E, this.wt_hi_out[0]);
    this._back1step(E, this.wt_hi_out[0], this.i_out[0]);
    E=E_new;
    for (var i = this.wt_hi_hi.length - 1; i >= 0; i--) {
      E_new = this._back1stepErr(E, this.wt_hi_hi[i]);
      this._back1step(E, this.wt_hi_hi[i], this.i_hid[i + 1]);
      E=E_new;  
    }
    this._back1step(E, this.wt_in_hi[0], this.i_hid[0]);
  },
  this._back1stepErr = function(E, wt) {
    var E_new = new Array(wt.length).fill(0);
    for (var i = 0; i < wt[0].length; i++) {
      var tot = 0;
      for (var j = 0; j < wt.length; j++) {
        tot += wt[j][i];
      }
      for (var j = 0; j < wt.length; j++) {
        E_new[j] += E[i] * wt[j][i] / tot;
      }
    }
    return E_new;
  }
  this._back1step = function(E, wt, I) {
    // sample of wt_hi_out
    for(var i = 0; i < E.length; i++) {
      if (I[i] > 0) {
        var d = - this.learningRate * E[i];
        for (var j = 0; j < wt.length; j++) {
          wt[j][i] -= d;
        }
      }
    
    }
  }
}
