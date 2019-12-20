var GT = {
  trainCnt : 0,
  matchCnt : 0,
  playCnt : 0,
  lastPlayTrainCnt : 0,
  lastPlayMatchCnt : 0,
  model : null,
  createModel : function() {
    this.trainCnt = 0;
    this.matchCnt = 0;
    this.playCnt = 0;
    this.lastPlayTrainCnt = 0;
    this.lastPlayMatchCnt = 0;
    this.model = new fnModel();
    this.model.initWithSizes(16, [3,16],4);
  },
  loadModel: function(model, trainCnt, matchCnt, playCnt, lastPlayTrainCnt, lastPlayMatchCnt) {
    this.trainCnt = trainCnt;
    this.matchCnt = matchCnt;
    this.playCnt = playCnt;
    this.lastPlayTrainCnt = lastPlayTrainCnt;
    this.lastPlayMatchCnt = lastPlayMatchCnt;
    this.model = new fnModel();
    if (model.wt_input) {
      this.model.initWithBaseWeights(model.wt_input, model.wt_hidden, model.wt_output);
    } else {
      this.model.initWithBaseWeights(model.wt_in_hi, model.wt_hi_hi, model.wt_hi_out);
    }
  }
}
