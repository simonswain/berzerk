/*global Backbone:true, $:true, _:true, App:true */
/*global ymd_to_s:true, s_to_ymd:true, sensible */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Models.Selection = Backbone.Model.extend({
  defaults: {
    'products': null,
    'product': null,

    'loading': false,
    'help': false,
    'format': 'chart',

    'date_cursor': false,

    // visible/selected dates
    'date_from': null,
    'date_to': null,

    // available dates
    'date_min': null,
    'date_max': null,

    // value min-max
    'value_min': 0,
    'value_max': 0,

    // visible value range on detail chart
    'visible_value_min': null,
    'visible_value_max': null,

    // dataset selection
    'count': null,
    'base': null,
    'limit': null // per-screen
  },
  initialize: function(vals, opts) {
    _.bindAll(this, 'initialize', 'onChangeFormat', 'onChangeProduct', 'findBounds', 'onChangeDate', 'setOverview','zoomView','centerView', 'onKey');
    var self = this;

    this.router = opts.router;

    this.on('change:format', this.onChangeFormat);
    this.on('change:product', this.onChangeProduct);

    this.on('change:date_from', this.onChangeDate);
    this.on('change:date_to', this.onChangeDate);

    this.trigger('change:product');

    $(window).on('keyup', this.onKey);
    
  },
  onKey: function(e){

    switch(e.which){

    case 67:
      // c
      this.set({'format': 'chart'});
      break;
    case 68:
      // d
      this.set({'format': 'data'});
      break;
    case 107:
    case 187:
      // +
      this.zoomView(-1);
      break;

    case 109:
    case 189:
      // -
      this.zoomView(1);
      break;

    case 38:
      // up;
      this.zoomView(1);
      break;

    case 40:
      // down
      this.zoomView(-1);
      break;

    case 33:
      // pgup
      this.moveView(-1);
      break;

    case 34:
      // pgdn
      this.moveView(1);
      break;

    case 39:
      // right;
      this.moveView(0.1);
      break;

    case 37:
      //left
      this.moveView(-0.1);
      break;

    case 191:
      // ? key
      this.set('help', !this.get('help'));
      break;
    }
  },
  onChangeFormat: function() {
    this.cache = {};
    this.set({
      'date_cursor': false,
      'visible_value_min': false,
      'visible_value_max': false
    }, {silent: true});
    this.trigger('update');
  },
  
  onChangeDate: function() {
    var self = this;
    self.trigger('range');
  },

  prevUri: false,
  timer: null,

  onChangeProduct: function() {
    var self = this;

    var products = this.get('products');
    var code = this.get('product');
    var product = _.findWhere(products, {code: code});

    var uri = product.uri;
    
    if ( uri === this.prevUri) {
      return;
    }

    this.prevUri = uri;

    App.router.navigate(uri, {trigger:false});

    if(App.cache.hasOwnProperty(code)){
      this.setOverview();
      return;
    }
    
    if(this.timer){
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(function(){
      self.set('loading', true);
    }, 1000);

    $.getJSON(uri, function(overview){

      self.findBounds(overview);
      App.cache[code] = overview;

      clearTimeout(self.timer);
      self.set('loading', false);    

      self.setOverview();

    });

  },
  findBounds: function(overview){
    // value: [date, value]
    overview.date_min = _.min(overview.values, function(x){ return x[0];})[0];
    overview.date_max = _.max(overview.values, function(x){ return x[0];})[0];

    overview.value_min = _.min(overview.values, function(x){ return x[1];})[1];
    overview.value_max = _.max(overview.values, function(x){ return x[1];})[1];
  },
  setOverview: function(){

    var products = this.get('products');
    var code = this.get('product');
    var product = _.findWhere(products, {code: code});
    var cache = App.cache[code] || {};

    // override these empty values
    var set = {
      style: product.style,
      values: null,

      date_min: null,
      date_max: null,

      value_min: null,
      value_max: null
    };

    if(cache.hasOwnProperty('values')){
      set.values = cache.values;
    }

    if(cache.hasOwnProperty('value_min')){
      set.value_min = cache.value_min;
    }

    if(cache.hasOwnProperty('value_max')){
      set.value_max = cache.value_max;
    }

    if(cache.hasOwnProperty('date_min')){
      set.date_min = cache.date_min;
    }

    if(cache.hasOwnProperty('date_max')){
      set.date_max = cache.date_max;
    }

    set.date_from = cache.date_min;
    set.date_to = cache.date_max;
    
    this.set(set);

    this.trigger('overview');
    this.trigger('update');

  },
  setRange: function(from_ymd, to_ymd){
    
    var tmp;

    var min_s = ymd_to_s(this.get('date_min'));
    var max_s = ymd_to_s(this.get('date_max'));
    
    if ( min_s === null || min_s === null ){
      return;
    }

    var from_s = ymd_to_s(from_ymd);
    var to_s = ymd_to_s(to_ymd);
    
    var range = to_s - from_s;

    // min width four weeks
    if(range < (28*86400)) {
      tmp = from_s + (range/2);
      to_s = tmp + (14*86400);
      from_s = tmp - (14*86400);
    }

    if ( to_s >= max_s ) {
      from_s = max_s - Math.abs(range);
      to_s = max_s;
    }

    if ( from_s <= min_s ) {
      from_s = min_s;
      to_s = min_s + Math.abs(range) ;
    }

    this.set({
      date_from: s_to_ymd(from_s),
      date_to: s_to_ymd(to_s)
    });

  },
  moveView: function(pct) {

    var min_s = ymd_to_s(this.get('date_min'));
    var max_s = ymd_to_s(this.get('date_max'));
    
    var from_s = ymd_to_s(this.get('date_from'));
    var to_s = ymd_to_s(this.get('date_to'));
    
    var range = to_s - from_s;

    var delta = range * pct;
    var factor = (pct > 0) ? 1 : -1;
    
    if(Math.abs(delta) <= 86400){      
      delta = 86400 * factor;
    }

    from_s = from_s + delta;
    to_s = to_s + delta;
    
    if ( to_s >= max_s ) {
      from_s = max_s - Math.abs(range);
      to_s = max_s;
    }

    if ( from_s <= min_s ) {
      from_s = min_s;
      to_s = min_s + Math.abs(range) ;
    }

    this.set({
      date_from: s_to_ymd(from_s),
      date_to: s_to_ymd(to_s)
    });

  },
  zoomView: function(delta, ratio) {
    ratio = ratio || 0.5;
    var z, tmp;

    var min_s = ymd_to_s(this.get('date_min'));
    var max_s = ymd_to_s(this.get('date_max'));
    
    var from_s = ymd_to_s(this.get('date_from'));
    var to_s = ymd_to_s(this.get('date_to'));

    z = (to_s - from_s) * 0.1 * + delta;

    from_s = from_s - ( z * ratio );

    if (from_s < min_s) {
      // min has gone off the edge - add the difference to max instead
      to_s += min_s - from_s;
      from_s = min_s;
    }

    to_s = to_s + ( z * ( 1-ratio) );
    if (to_s > max_s) {
      // max has gone off the edge - add the difference to min instead
      from_s -= (to_s - max_s);
      to_s = max_s;
    }

    // min width four weeks
    if(to_s - from_s < (28*86400)) {
      tmp = from_s + ((to_s - from_s)/2);
      to_s = tmp + (14*86400);
      from_s = tmp - (14*86400);
    }

    if (from_s < min_s) {
      from_s = min_s;
    }

    if(to_s < from_s) {
      tmp = to_s;
      to_s = from_s;
      from_s = tmp;
    }

    this.set({
      date_from: s_to_ymd(from_s),
      date_to: s_to_ymd(to_s)
    });
    this.trigger('update');

  },
  centerView: function(x) {
    // x is proportion of full data range. 0 - 1

    var min_s = ymd_to_s(this.get('date_min'));
    var max_s = ymd_to_s(this.get('date_max'));

    if ( min_s === null || min_s === null ){
      return;
    }
    
    var from_s = ymd_to_s(this.get('date_from'));
    var to_s = ymd_to_s(this.get('date_to'));

    var at = min_s + ((max_s - min_s) * x);
    var range = to_s - from_s;

    from_s = at - (range/2);
    to_s = from_s + range;

    if (from_s < min_s){
      from_s = min_s;
      to_s = from_s + range;
    }

    if (to_s > max_s){
      from_s = max_s - range;
      to_s = max_s;
    }
    
    this.set({
      date_from: s_to_ymd(from_s),
      date_to: s_to_ymd(to_s)
    });
    this.trigger('update');
  }

});

