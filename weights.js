var fnWeights = {
  layers : 3,
  nodes : 16,
  wt : [],
  init : function(base_wt) {
    if (_wt) {
      wt = base_wt;
      layers = wt.length;
      nodes = Math.sqrt(wt[0].length);
      return;
    }
    
    var n_sqr = nodes * nodes;
    for (var i = 0; i < layers; i++) {
      wt.push([]);
      for (var j = 0; j < n_sqr; j++) {
        wt[i].push(Math.rnd());
      }
    }
    
  }
}
