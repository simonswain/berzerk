/*global Backbone:true, $:true, _:true, moment: true, Raphael: true, App:true */
/*global ymd_to_s:true, s_to_ymd:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Interactive = Backbone.View.extend({
  template : _.template('<div class="chart" id="interactive-chart"></div>'),
  els: {},
  g: {},
  atttrs: App.attrs,
  lastX: false,
  initialize : function(opts) {
    var self = this;

    _.bindAll(
      this, 
      'initialize', 'onClose', 'onMousewheel', 'onMouseMove', 'render', 
      'update','trackCursor','clearCursor', 'onSwipeStatus'
    );

    this.width = $(this.el).width();

    this.render();
    this.update();

    $(this.el).on('mousewheel', this.onMousewheel );
    $(this.el).on('mousemove', this.onMouseMove );
    $(this.el).on('mouseleave', this.clearCursor );

    this.listenTo(this.model, 'update', this.update);
    this.listenTo(this.model, 'change:date_cursor', this.update);

    $(this.el).swipe( {
      swipeStatus: this.onSwipeStatus,
      threshold:200,
      fingers:'all',
      pinchThreshold:0
    });

  },
  onClose: function() {
    this.r.remove();
    this.clearCursor();
  },
  swipeLast: 0,
  swipeDir: false,
  swipeDay_w: false,
  onSwipeStatus: function(event, phase, direction, distance, duration, fingers) {

    var delta, date_from, date_to;

    switch(phase) {

    case 'start':

      this.swipeLast = 0;
      this.model.set('date_cursor', '');
      
      // width of day in pixels
      date_from = this.model.get('date_from');
      date_to = this.model.get('date_to');
      this.swipeDay_w = 86400 * this.w / (ymd_to_s(date_to) - ymd_to_s(date_from));
      break;

    case 'move':

      this.model.set({'date_cursor': ''});
      // handle changing direction mid-swipe
      if(distance < this.swipeLast){
        delta = this.swipeLast - distance;
        direction = ( direction === 'left' ) ? 'right' : 'left';
      } else {
        delta = distance - this.swipeLast;
      }

      if(delta > this.swipeDay_w) {
        this.swipeLast = distance;
      } else {
        return;
      }

      if(direction === 'right') {
        delta *= -1;
      }

      this.model.moveView((1/this.w)*delta);
      break;

    case 'end':
      this.swipeLast = 0;
      break;
    }
    
  },
  onMouseMove: function(e){
    this.trackCursor(e.offsetX);
  },
  onMousewheel: function(e, delta, deltaX, deltaY) {
    this.model.zoomView (delta, (1/this.width) * e.offsetX);
    this.trackCursor(e.offsetX);
  },
  render: function() {

    if (this.r) {
      this.r.remove();
    }

    $(this.el).html(this.template());
    this.$('.chart').css({height: $(this.el).height()});

    var c = $('#interactive-chart');
    this.w = c.width();
    this.h = c.height();

    /*jshint newcap:false */
    this.r = Raphael('interactive-chart', this.w, this.h);
    /*jshint newcap:true */

    this.els.range = this.$('ul.range');


    return this;
  },
  update: function() {

    if(this.model.get('format') === 'chart'){
      $(this.el).show();
    } else {
      $(this.el).hide();
      return;
    }

    var date_cursor = this.model.get('date_cursor');

    this.r.clear();

    if(!date_cursor){
      return;
    }

    var cache = this.model.cache;

    if(! cache || !cache.hasOwnProperty(date_cursor)){
      return;
    }

    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    if(!date_from || !date_to){
      return;
    }

    var s_from = ymd_to_s(date_from);
    var s_to = ymd_to_s(date_to);

    var dx = s_to - s_from;
    var xf = dx / this.w;

    var day_w = Math.floor(86400 / xf);

    var day_x = ((ymd_to_s(date_cursor) - s_from) / xf) - day_w;

    var value = cache[date_cursor];
    
    this.r.text(
      day_x, 
      12, 
      date_cursor.substr(0,4) + '-' + date_cursor.substr(4,2) + '-' + date_cursor.substr(6,2)
    ).attr(App.attrs.hover_date);
    
    this.r.text(
      day_x, 
      32, 
      'Value: $' + (value.value/100).toFixed(2)
    ).attr(App.attrs.hover);
  },
  clearCursor: function() {
    this.model.set('date_cursor', '');
  },
  trackCursor: function(x) {

    var h = this.h;
    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    if(!date_from || ! date_to){
      return;
    }

    var s_from = ymd_to_s(date_from);
    var s_to = ymd_to_s(date_to);

    var dx = s_to - s_from;
    var xf = dx / this.w;
    var t = s_from + (x * xf) + 43200 + 86400;

    var ymd = moment(t*1000).format('YYYYMMDD');

    if (ymd < date_from || ymd > date_to){
      ymd = false;
    }

    this.model.set('date_cursor', ymd);

  }
});

