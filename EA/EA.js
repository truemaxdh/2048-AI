var EA = {
  generationId : 0,
  modelNum : 100,
  models : [],
  scores : [],
  createModels : function(_modelNum) {
    this.modelNum = _modelNum;
    for(var i_m = 0; i_m < this.modelNum; i_m++) {
      var m = new fnModel();
      m.initWithSizes(16, [3,16],4);
      this.models.push(m);
      this.scores.push(0);
    }
  },
  loadModels: function(models, scores) {
	  this.modelNum = models.length;
	  this.models = [];
	  for (var i = 0; i < this.modelNum; i++) {
		  var m = new fnModel();
	      m.initWithBaseWeights(models[i].wt_input, models[i].wt_hidden, models[i].wt_output);
	      this.models.push(m);  
	  }	  
	  this.scores = scores;
	  
  },
  sortByScore : function() {
    for(var i_m1 = 0; i_m1 < (this.modelNum-1); i_m1++) {
      for(var i_m2 = (i_m1 + 1); i_m2 < this.modelNum; i_m2++) {
        if (this.scores[i_m1] < this.scores[i_m2]) {
          var tmp = this.models[i_m1];
          this.models[i_m1] = this.models[i_m2];
          this.models[i_m2] = tmp;
          
          tmp = this.scores[i_m1];
          this.scores[i_m1] = this.scores[i_m2];
          this.scores[i_m2] = tmp;
        }
      }
    }
  },
  evolve : function(_mutationRatio, _phase) {
	if (!_mutationRatio) _mutationRatio = 0.1;
    if (!_phase) _phase = 2;
    
    if (_phase==1) {
    	var half = this.modelNum / 2;
        for(var i_m = 0; i_m < half; i_m++) {
          var m_refer = this.models[i_m];
          var m_new = new fnModel();
          m_new.initWithBaseWeights(m_refer.wt_input, m_refer.wt_hidden, m_refer.wt_output);
          this._mutate(m_new.wt_input, _mutationRatio);
          this._mutate(m_new.wt_hidden, _mutationRatio);
          this._mutate(m_new.wt_output, _mutationRatio);
          this.models[half + i_m] = m_new;
          
        }
    }
    
    if (_phase==2) {
    	var oneThird = this.modelNum / 3;
    	
    	for(var i_m = 0; i_m < oneThird; i_m++) {
    		var m_refer = this.models[i_m];
        	var m_new;
        	
    		// 1. mutation
        	m_new = new fnModel();
        	m_new.initWithBaseWeights(m_refer.wt_input, m_refer.wt_hidden, m_refer.wt_output);
        	this._mutate(m_new.wt_input, _mutationRatio);
        	this._mutate(m_new.wt_hidden, _mutationRatio);
        	this._mutate(m_new.wt_output, _mutationRatio);
        	this.models[oneThird + i_m] = m_new;
        	
        	// 2. crossover and new
        	m_new = new fnModel();
        	if (i_m < (oneThird - 1)) {
        		// crossover
        		m_new.initWithBaseWeights(m_refer.wt_input, m_refer.wt_hidden, m_refer.wt_output);
        		var m_refer2 = this.models[i_m + 1];
        		this._crossover(m_new, m_refer2, m_new);
        	} else {
        		// new
        		m_new.initWithSizes(16, [3,16],4);
        	}
        	this.models[oneThird * 2 + i_m] = m_new;
        }
    }
    
    for(var i_m = 0; i_m < this.modelNum; i_m++) {
    	this.scores[i_m] = 0;
    }
    this.generationId++;
  },
  _mutate : function(wt, ratio) {
    var cnt = wt.length * wt[0].length * wt[0][0].length * ratio;
    for (var i = 0;i < cnt;i++) {
      var r_layer = Math.floor(Math.random() * wt.length);
      var r_row = Math.floor(Math.random() * wt[0].length);
      var r_col = Math.floor(Math.random() * wt[0][0].length);
      var val = cutOff(wt[r_layer][r_row][r_col] + Math.random() * 0.4 - 0.2);
      (val >= 1.0) && (val = 0.9999999);
      (val < -1.0) && (val = -1.0);
      //console.log(val);
      wt[r_layer][r_row][r_col] = val;
    }
  },
  _crossover : function(wt1, wt2, wt_child) {
    for (var i_layer = 0;i_layer < wt1.length;i_layer++) {
    	for (var i_row = 0;i_row < wt1[0].length;i_row++) {
    		for (var i_col = 0;i_col < wt1[0][0].length;i_col++) {
    			wt_child[i_layer][i_row][i_col] = cutOff((wt1[i_layer][i_row][i_col] + wt2[i_layer][i_row][i_col]) / 2.0);    			
    		}
    	}
    }
  } 
};
