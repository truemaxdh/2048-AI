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
	  this.models = [];
	  for (var i = 0; i < models.length; i++) {
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
  evolve : function(_mutationRatio) {
	  if (!_mutationRatio) _mutationRatio = 0.1;
    var half = this.modelNum / 2;
    for(var i_m = 0; i_m < half; i_m++) {
      var m_refer = this.models[i_m];
      var m_new = new fnModel();
      m_new.initWithBaseWeights(m_refer.wt_input, m_refer.wt_hidden, m_refer.wt_output);
      this._mutate(m_new.wt_input, _mutationRatio);
      this._mutate(m_new.wt_hidden, _mutationRatio);
      this._mutate(m_new.wt_output, _mutationRatio);
      this.models[half + i_m] = m_new;
      
      this.scores[i_m] = 0;
      this.scores[half + i_m] = 0;
    }
    this.generationId++;
  },
  _mutate : function(wt, ratio) {
    var cnt = wt.length * wt[0].length * wt[0][0].length * ratio;
    for (var i = 0;i < cnt;i++) {
      var r_layer = Math.random() * wt.length;
      var r_row = Math.random() * wt[0].length;
      var r_col = Math.random() * wt[0][0].length;
      wt[r_layer][r_row][r_col] = Math.random();
    }
  },
  
}
