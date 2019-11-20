var EA = {
  modelNum : 100,
  models : [],
  scores : [],
  createModels : function(_modelNum) {
    modelNum = _modelNum;
    for(var i_m = 0; i_m < modelNum; i_m++) {
      var m = new fnModel();
      m.initWithSizes(16, [3,16],4);
      models.push(m);
      scores.push[0];
    }
  },
  sortByScore : function() {
    for(var i_m1 = 0; i_m1 < (modelNum-1); i_m1++) {
      for(var i_m2 = 1; i_m2 < modelNum; i_m2++) {
        if (scores[i_m1] < scores[i_m2]) {
          var tmp = models[i_m1];
          models[i_m1] = models[i_m2];
          models[i_m2] = tmp;
          
          tmp = scores[i_m1];
          scores[i_m1] = scores[i_m2];
          scores[i_m2] = tmp;
        }
      }
    }
  },
  evolve : function(_mutationRatio) {
    var half = modelNum / 2;
    for(var i_m = 0; i_m < half; i_m++) {
      var m_refer = models[i_m];
      var m_new = new fnModel();
      m_new.initWithBaseWeights(m_refer.wt_input, m_refer.wt_hidden, m_refer.wt_output);
      _mutate(m_new.wt_input, _mutationRatio);
      _mutate(m_new.wt_hidden, _mutationRatio);
      _mutate(m_new.wt_output, _mutationRatio);
    }
  },
  _mutate : function(wt, ratio) {
    var cnt = wt.length * wt[0].length * wt[0][0].length * ratio;
    for (var i = 0;i < cnt;i++) {
      var r_layer = Math.rnd() * wt.length;
      var r_row = Math.rnd() * wt[0].length;
      var r_col = Math.rnd() * wt[0][0].length;
      wt[r_layer][r_row][r_col] = Math.rnd();
    }
  },
  save : function(_path) {
  },
  load : function(_path) {
  }
}
