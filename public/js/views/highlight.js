/*global Backbone:true, $:true, _:true, moment: true, Raphael: true, App:true */
/*global ymd_to_s:true, s_to_ymd:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Highlight = Backbone.View.extend({
  template : _.template('<div class="chart" id="highlight-chart"></div>'),
  g: {},
  atttrs: App.attrs,
  initialize : function(opts) {
    var self = this;
    _.bindAll(this, 'initialize', 'onClose', 'render', 'update','updateLines','updateCursor');
    this.width = $(this.el).width();
    this.render();
    this.update();
    this.listenTo(this.model, 'update', this.update);
    this.listenTo(this.model, 'range', this.update);
    this.listenTo(this.model, 'change:date_cursor', this.update);
  },
  onClose: function() {
    this.r.remove();
  },
  render: function() {

    if ( this.r ) {
      this.r.remove();
    }

    $(this.el).html(this.template());
    this.$('.chart').css({height: $(this.el).height()});

    var c = $('#highlight-chart');
    this.w = c.width();
    this.h = c.height();

    /*jshint newcap:false */
    this.r = Raphael('highlight-chart', this.w, this.h);
    /*jshint newcap:true */

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

    this.updateLines();
    this.updateCursor();

  },
  updateLines: function() {

    var value_min = this.model.get('visible_value_min');
    var value_max = this.model.get('visible_value_max');

    if (isNaN(value_min) || isNaN(value_max)){
      return;
    }

    if (value_min === null || value_max === null){
      return;
    }

    if (value_min === value_max){
      return;
    }

    var width = this.w;

    var range = value_max - value_min;
    var offset = -1 * value_min;

    var height = this.h;

    var yf = this.yf = height / range;

    var y;

    if ( value_min < 0 ) {
      y = height - (offset*yf);
      this.r.path('M 0 ' + y + ' L ' + this.w + ' ' + y ).attr(App.attrs.scale);
    }

    // positive and negative half values

      y = height - ((range * 0.25) * yf);
      this.r.path('M 0 ' + y + ' L ' + this.w + ' ' + y ).attr(App.attrs.scale);

      y = height - ((range * 0.50) * yf);
      this.r.path('M 0 ' + y + ' L ' + this.w + ' ' + y ).attr(App.attrs.scale);

      y = height - ((range * 0.75) * yf);
      this.r.path('M 0 ' + y + ' L ' + this.w + ' ' + y ).attr(App.attrs.scale);

  },
  updateCursor: function() {

    if(this.model.get('format') === 'chart'){
      $(this.el).show();
    } else {
      $(this.el).hide();
      return;
    }

    var date_cursor = this.model.get('date_cursor');

    if(!date_cursor){
      return;
    }
    
    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    var s_from = ymd_to_s(date_from);
    var s_to = ymd_to_s(date_to);

    var dx = s_to - s_from;
    var xf = dx / this.w;

    var day_w = Math.floor(86400 / xf);

    var day_x = ((ymd_to_s(date_cursor) - s_from - 86400 - 43200) / xf);

    if(day_w < 1) {
      day_w = 1;
    }

    this.r.rect(day_x, 0, day_w, this.h).attr(App.attrs.day_cursor);

  }
});
