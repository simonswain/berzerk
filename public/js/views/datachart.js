/*global Backbone:true, $:true, _:true, moment: true, Raphael: true, App:true */
/*global ymd_to_s:true, s_to_ymd:true, sensible */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Datachart = Backbone.View.extend({
  template : _.template('<div id="datachart" class="chart"></div>'),
  initialize : function(opts) {
    var self = this;
    this.model = opts.model;
    _.bindAll(this, 'initialize', 'onClose', 'render', 'update');

    this.render();

    this.listenTo(this.model, 'update', this.update);
    this.listenTo(this.model, 'range', this.update);

  },
  onClose: function(){
    this.r.remove();
  },
  attrs: App.attrs,
  render: function() {

    if ( this.r ) {
      this.r.remove();
    }

    $(this.el).html(this.template());
    this.$('.chart').css({height: $(this.el).height()});

    var c = $('#datachart');
    this.w = c.width();
    this.h = c.height();

    /*jshint newcap:false */
    this.r = Raphael('datachart', this.w, this.h + 2);
    /*jshint newcap:true */

    this.update();

    return this;
  },
  update: _.debounce(function() {

    if(this.model.get('format') === 'chart'){
      $(this.el).removeClass('inactive');     
    } else {
      $(this.el).addClass('inactive');
      return;
    }

    var self = this;

    var i, ii, x, y;

    this.r.clear();

    var date_min = this.model.get('date_min');
    var date_max = this.model.get('date_max');

    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    if (!date_min || !date_max || !date_from || !date_to){
      return;
    }

    var nice, values;

    values = this.model.get('values');
    if (!values || values.length === 0 ){
      return;
    }

    var from_s = ymd_to_s(date_from);
    var from_ms = from_s * 1000;

    var to_s = ymd_to_s(date_to);
    var to_ms = to_s * 1000;

    var dx = to_s - from_s;
    var days = Math.ceil(dx/86400);

    var value_min = this.model.get('value_min');
    var value_max = this.model.get('value_max');

    var w = this.w;
    var h = this.h;

    var xf = w / dx;

    var dd;
    var day;
    var day_width = 86400 * xf;

    var t;

    if ( days <= 180 ) {
      t = from_ms;
      while (t <= to_ms){
        x = (((t - from_ms - 43200000)/1000)) * xf;

        day = new Date(t).getDay();
        if(day === 0 || day === 6){
          this.r
            .rect(x - day_width, 0, day_width, h)
            .attr(this.attrs.weekend);
        }
        
        this.r
          .path('M' + x + ' 0 L' + x + ' ' + h)
          .attr(this.attrs.scale);

        t += 86400000;
      }
    }

    if ( days > 180 && days <= 240 ) {
      t = from_ms;
      while (t <= to_ms){
        x = (((t - from_ms - 43200000)/1000)) * xf;

        day = new Date(t).getDay();
        if(day === 0 || day === 6){
          this.r
            .rect(x - day_width, 0, day_width, h)
            .attr(this.attrs.weekend);
        }

        t += 86400000;
      }
    }

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

    // year lines
    dd = new Date(from_ms);
    dd.setMonth(0);
    dd.setDate(1);
    dd.setMinutes(0);
    dd.setHours(0);
    dd.setSeconds(0);

    while (dd.getFullYear() <= date_to.substr(0,4)){
      x = (((dd.getTime() - from_ms)/1000) - 86400 - 43200) * xf;

      this.r
        .path('M' + x + ' 0 L' + x + ' ' + h)
        .attr(this.attrs.year);

      dd.setFullYear(dd.getFullYear() + 1);

    }

    var svg, px, py;

    var cache = this.model.cache = {};

    // find highs and lows within visible range

    var range = [];
    var v_min = Infinity;
    var v_max = -Infinity;

    _.each(values, function(val) {
      if(String(val[0]) < date_from || String(val[0]) > date_to){
        return;
      }

      val[1] = Number(val[1]);

      range.push(val);

      if(val[1] < v_min){
        v_min = val[1];
      }

      if(val[1] > v_max){
        v_max = val[1];
      }

    });


    nice = sensible(v_min, v_max);

    v_min = nice[0];
    v_max = nice[1];

    var dy = v_max - v_min;

    if(dy === 0) {
      dy = 1;
    }

    var yf = h / dy;

    this.model.set({
      'visible_value_min': v_min,
      'visible_value_max': v_max
    });

    // draw charts

    if (values.length === 1 ){
      this.r
        .path('M' + 0 + ' ' + (h/2) + 'L' + w + ' ' + (h/2))
        .attr(this.attrs.value);
      return;
    }


    svg = [];

    var first = true;
    
    _.each(values, function(val) {

      if(String(val[0]) < date_from || String(val[0]) > date_to){
        return;
      }

      cache[val[0]] = {
        value: val[1]
      };
      
      var x = ((ymd_to_s(String(val[0])) - from_s) * xf).toFixed(2);
      var y;

      if(v_min === v_max) {
        y = (h/2).toFixed(0);
      } else {
        y = ((Number(val[1] - v_min)) * yf).toFixed(2);
      }
      if(first){
        first = false;
        svg.push('M' + x + ' ' + (h - y));
      } else {
        svg.push('L' + x + ' ' + (h - y));
      }
      px = x;
      py = y;
    });


    if(svg.length>1){
      this.r.path(svg.join(' ')).attr(this.attrs.value);
    }

    this.r.path('M 8 32 L 16 32').attr(this.attrs.value);
    this.r.text(24, 32, 'Value').attr(this.attrs.label);

    this.model.trigger('valuerange');


  }, 5)


});
