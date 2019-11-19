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
  }
}
