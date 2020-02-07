class GT {
  constructor(cols, rows) {
    this.trainCnt = 0;
    this.matchCnt = 0;
    this.playCnt = 0;
    this.lastPlayTrainCnt = 0;
    this.lastPlayMatchCnt = 0;
    this.model = null;
    this.cols = cols;
    this.rows = rows;
  }

  createModel() {
    this.trainCnt = 0;
    this.matchCnt = 0;
    this.playCnt = 0;
    this.lastPlayTrainCnt = 0;
    this.lastPlayMatchCnt = 0;
    this.model = new fnModel();
    //this.model.initWithSizes(16, [3,16],4);
    //this.model.initWithSizes(16, [3,2],4);
    this.model.initWithSizes(16, [this.cols - 1, this.rows], 4);
  }

  loadModel(model, trainCnt, matchCnt, playCnt, lastPlayTrainCnt, lastPlayMatchCnt) {
    this.trainCnt = trainCnt;
    this.matchCnt = matchCnt;
    this.playCnt = playCnt;
    this.lastPlayTrainCnt = lastPlayTrainCnt;
    this.lastPlayMatchCnt = lastPlayMatchCnt;
    this.model = new fnModel();
    if (model.wt_input) {
      this.model.initWithBaseWeights(model.wt_input, model.wt_hidden, model.wt_output);
    }
    else {
      this.model.initWithBaseWeights(model.wt_in_hi, model.wt_hi_hi, model.wt_hi_out);
    }
  }
}

var GTStore = [new GT(4,2), new GT(2,16), new GT(3,16), new GT(4,16)];