var BP = {
  trainCnt : 0,
  matchCnt : 0,
  model : null,
  createModel : function() {
    this.trainCnt = 0;
    this.matchCnt = 0
    this.model = new fnModel();
    this.model.initWithSizes(16, [3,16],4);
  },
  loadModel: function(model, trainCnt, matchCnt) {
    this.trainCnt = trainCnt;
    this.matchCnt = matchCnt;
    this.model = new fnModel();
	  this.model.initWithBaseWeights(model.wt_input, model.wt_hidden, model.wt_output);
	      this.models.push(m);  
  }
}
