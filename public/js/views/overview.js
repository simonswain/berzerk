/*global Backbone:true, $:true, _:true, App:true, Raphael: true */
/*global ymd_to_s:true, s_to_ymd:true, sensible: true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Overview = Backbone.View.extend({
  template : _.template('\
<div class="rail">\
<div class="range"></div><div class="max"></div><div class="min"></div>\
<div class="cover cover-left"></div><div class="cover cover-right"></div>\
</div>\
<div id="overview-chart" class="chart"></div>'),
  els: {},
  cursor: null,
  attrs: App.attrs,
  initialize : function() {
    var self = this;
    _.bindAll(
      this, 
      'initialize', 'render', 'draggable', 'updateChart', 'setRange', 
      'centerRange', 'updateRange', 'updateCursor', 'onMousewheel', 'onClick'
    );

    this.render();
    this.draggable();
    
    this.listenTo(this.model, 'overview', this.updateChart);
    this.listenTo(this.model, 'change', this.updateRange);
    this.listenTo(this.model, 'change:date_cursor', this.updateCursor);

    $(this.el).on('mousewheel', this.onMousewheel);

  },
  events: {
    'click .cover': 'onClick'
  },
  onClose: function(){
    this.stopListening();
    $(this.el).off('mousewheel', this.onMousewheel);
    this.r.remove();
    this.r = null;
  },
  render: function() {
    $(this.el).html(this.template());
    var c = $('.chart');
    this.w = c.width();
    this.h = c.height();

    /*jshint newcap:false */
    this.r = Raphael('overview-chart', this.w, this.h);
    /*jshint newcap:true */

    this.updateChart();
  },    
  onClick: function(e) {
    this.model.centerView((1/this.w) * e.clientX);
  },
  onMousewheel: function(event, delta, deltaX, deltaY) {
    this.model.zoomView(delta);
  },
  updateChart: function() {
    var self = this;

    this.r.clear();    

    var date_min = this.model.get('date_min');
    var date_max = this.model.get('date_max');

    if (!date_min || !date_max){
      return;
    }

    // date in seconds
    var s_min = ymd_to_s(date_min);
    var s_max = ymd_to_s(date_max);

    var from_ms = s_min * 1000;
    var to_ms = s_max * 1000;

    var value_min = this.model.get('value_min');
    var value_max = this.model.get('value_max');

    var nice = sensible(value_min, value_max);

    value_min = nice[0];
    value_max = nice[1];

    var values = this.model.get('values');
    
    var i, ii, x, y, px;

    var legend_h = 24;

    var dx = s_max - s_min;
    var days = Math.ceil(dx/86400);

    var h = this.h;
    var w = this.w;

    var xf = w / dx;
    var dy = (value_max - value_min);

    if(dy === 0) {
      dy = 1;
    }
    var yf = h / dy;

    var r = this.r;

    var dd;

    // month lines
    dd = new Date(from_ms);
    dd.setMonth(0);
    dd.setDate(1);
    dd.setMinutes(0);
    dd.setHours(0);
    dd.setSeconds(0);

    while (dd.getTime() <= to_ms){

      x = (((dd.getTime() - from_ms)/1000) - 86400 - 43200) * xf;

      this.r
        .path('M' + x + ' 0 L' + x + ' ' + h)
        .attr(this.attrs.month);


      if(dd.getMonth() === 11){
        dd.setMonth(0);
        dd.setFullYear(dd.getFullYear() + 1);
      } else { 
        dd.setMonth(dd.getMonth() + 1);
      }
    }

    // years
    dd = new Date(from_ms);
    dd.setMonth(0);
    dd.setDate(1);
    dd.setMinutes(0);
    dd.setHours(0);
    dd.setSeconds(0);

    while (dd.getFullYear() <= date_max.substr(0,4)){

      x = (((dd.getTime() - from_ms)/1000) - 86400 - 43200) * xf;

      this.r
        .path('M' + x + ' 0 L' + x + ' ' + h)
        .attr(this.attrs.year);

      this.r.text(x + 4, 8, dd.getFullYear()).attr(this.attrs.year_label);

      dd.setFullYear(dd.getFullYear() + 1);

    }

    var svg = [];
    var first;

    _.each(values, function addLine(val, i) {
      var x = (ymd_to_s(String(val[0])) - s_min - 86400) * xf;
      //var x = ((val[0] - s_min) * xf).toFixed(2);
      var y;
      if(value_max === value_min){
        y = (h/2).toFixed(2);
      } else {
        y = (Number(val[1] - value_min) * yf).toFixed(2);
      }
      if(i === 0){
        svg.push('M' + x + ' ' + (h - y));
      } else {
        svg.push('L' + x + ' ' + (h - y));
      }
    });

    if(svg.length<=0){
      return;
    }
    this.r.path(svg.join(' ')).attr(this.attrs.value);


  },
  updateCursor: function() {

    var date_cursor = this.model.get('date_cursor');

    if(!date_cursor){
      if(this.cursor){
        this.cursor.remove();
      }
      return;
    }

    var s_cursor = ymd_to_s(date_cursor);

    var date_min = this.model.get('date_min');
    var date_max = this.model.get('date_max');
    
    if (!date_min || !date_max){
      return;
    }

    // date in seconds
    var s_min = ymd_to_s(date_min);
    var s_max = ymd_to_s(date_max);

    var dx = s_max - s_min;

    var w = this.w;

    var xf = w / dx;
    
    var x = (s_cursor - s_min - 86400) * xf;
    var day_w = Math.floor(86400 *xf);

    if(this.cursor){
      this.cursor.remove();
    }

    if(day_w < 1) {
      day_w = 1;
    }

    this.cursor = this.r.rect(x, 0, day_w, this.h).attr(this.attrs.overview_cursor);

  },
  setRange: function(from, to) {
    var tmp;

    if ( from > to ) {
      tmp = to;
      to = from;
      from = tmp;
    }

    this.start = from;
    this.end = to;
    this.range = to - from;
    
    var m = this.model.toJSON();

    if ( m.date_min === null || m.date_max === null ){
      return;
    }

    var min = ymd_to_s(m.date_min);
    var max = ymd_to_s(m.date_max);
    var range = max - min;

    var f = range / this.w;
    
    var start = Math.floor( min + from * f);
    var end = Math.floor( min + to * f);


    if(start<min){
      start = min;
    }

    if(end>max){
      end = max;
    }

    this.model.setRange(s_to_ymd(start), s_to_ymd(end));

  },
  centerRange: function(x) {
    var m = this.model.toJSON();

    if ( m.date_min === null || m.date_max === null ){
      return;
    }

    var min = ymd_to_s(m.date_min);
    var max = ymd_to_s(m.date_max);

    var from = ymd_to_s(m.date_from);
    var to = ymd_to_s(m.date_to);

    var at = (((1/this.w) * x.toFixed(2))) * this.w;
    var range = ((to - from) / (max-min)) * this.w;

    var start, end;
    start = at - (range/2);
    end = start + range;

    if (start < 0){
      start = 0;
      end = range;
    }
    
    if (end > this.w){
      start = this.w - range;
      end = this.w;
    }
    
    this.setRange(start, end);

  },
  updateRange: function() {

    var date_min = this.model.get('date_min');
    var date_max = this.model.get('date_max');

    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    if (!date_min || !date_max || !date_from || !date_to){
      return;
    }

    var min_s = ymd_to_s(date_min);
    var max_s = ymd_to_s(date_max);
    var dx = max_s - min_s;

    var from_s = ymd_to_s(date_from);
    var to_s = ymd_to_s(date_to);
    var xf = this.w / dx;
    
    var left = (from_s - min_s) * xf;
    var right = (to_s - min_s) * xf;

    // respond to model here
    this.els.coverLeft.css({width: left});
    this.els.coverRight.css({width: this.w - right});

    this.els.min.css({left: left});
    this.els.max.css({left: right - 4});
    
    this.els.range.css({left: left, width: right - left});
  },
  draggable: function() {

    var self = this;
    this.els.rail = this.$('.rail');
    
    this.min = 0;
    this.max = this.els.rail.width();
    
    this.els.range = this.$('.range');
    this.els.min = this.els.rail.find('.min');
    this.els.max = this.els.rail.find('.max');

    this.els.coverLeft = this.els.rail.find('.cover-left');
    this.els.coverRight = this.els.rail.find('.cover-right');
    
    this.end = this.max - 4;
    this.start = this.max - 100;
    this.range = 100;
    this.updateRange();

    this.els.range.draggable({
      start: function(start, ui) {
      },
      containment: self.els.rail,
      drag: function ( event, ui ) {
        var x = ui.position.left;
        var min = x;
        var max = x + ui.helper.width();       
        self.setRange(min, max);
      },
      stop: function ( event, ui ) {
        var x = ui.position.left;
        var min = x;
        var max = x + ui.helper.width();
        self.setRange(min, max);
      }
    });

    this.els.min.draggable({
      start: function(start, ui) {
      },
      containment: self.els.rail,
      drag: function ( event, ui ) {
        self.setRange(ui.position.left, self.end);
      },
      stop: function ( event, ui ) {
        self.setRange(ui.position.left, self.end);
      }
    });

    this.els.max.draggable({
      start: function(start, ui) {
      },
      containment: self.els.rail,
      drag: function ( event, ui ) {
        self.setRange(self.start, ui.position.left + 4);
      },
      stop: function ( event, ui ) {
        self.setRange(self.start, ui.position.left + 4);
      }
    });

  }
});
