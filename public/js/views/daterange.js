/*global Backbone:true, $:true, _:true, App:true, moment: true */
/*global ymd_to_s:true, s_to_ymd:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Daterange = Backbone.View.extend({
  template : _.template(''),
  els: {},
  g: null,
  initialize : function(opts) {
    var self = this;

    _.bindAll(this, 'initialize', 'onClose', 'render');
    this.render();

    this.listenTo(this.model, 'update', this.render);
    this.listenTo(this.model, 'range', this.render);

  },
  events: {
  },
  onClose: function() {
    this.stopListening();
  },
  render: function() {

    var el = $(this.el);

    if(this.model.get('format') === 'chart'){
      $(this.el).show();
    } else {
      $(this.el).hide();
      return;
    }

    var width = $(this.el).width();

    var date_min = this.model.get('date_min');
    var date_max = this.model.get('date_max');

    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    if (!date_min || !date_max){
      return;
    }

    if (!date_from || !date_to){
      return;
    }

    var min_s = ymd_to_s(date_min);
    var max_s = ymd_to_s(date_max);

    var from_s = ymd_to_s(date_from);
    var to_s = ymd_to_s(date_to);

    if ( from_s < min_s ) {
      from_s = min_s;
    }

    if ( to_s > max_s ) {
      to_s = max_s;
    }

    // lets work in seconds
    var seconds = to_s - from_s;
    var xf = width / seconds;
    var days = seconds / 86400;

    var years = days / 365;
    var x, dd, s, d, t;

    var from_ms = from_s * 1000;
    var to_ms = to_s * 1000;

    el.html('');

    if (min_s === max_s){
      $('<span />')
        .addClass('timestamp')
        .html(moment(new Date(date_from)).format('YYYY-MM-DD'))
        .appendTo(el);
      return;
    }

    if ( days <= 60 ) {
      t = from_ms;
      while (t <= to_ms){
        x = (((t - from_ms)/1000) - 86400) * xf;
        $('<span class="day" />')
          .html(moment(new Date(t)).format('ddd'))
          .appendTo(el)
          .css({left: x - 12});

        $('<span class="date" />')
          .html(moment(new Date(t)).format('DD'))
          .appendTo(el)
          .css({left: x - 12});

        t += 86400000;
      }
    }

    if ( days <= 365 ) {
      dd = new Date(from_ms);
      dd.setMonth(0);
      dd.setDate(1);
      dd.setMinutes(0);
      dd.setHours(0);
      dd.setSeconds(0);

      while (dd.getTime() <= to_ms){

        x = (((dd.getTime() - from_ms)/1000) - 86400) * xf;

        if(days > 60){
          $('<span class="day" />')
            .html(moment(dd).format('ddd'))
            .appendTo(el)
            .css({left: x - 13});

          $('<span class="date" />')
            .html(moment(dd).format('DD'))
            .appendTo(el)
            .css({left: x - 12});
        }
        
        $('<span class="month" />')
          .html(moment(dd).format('MMM'))
          .appendTo(el)
          .css({left: x - 32});

        $('<span class="year" />')
          .html(moment(dd).format('YYYY'))
          .appendTo(el)
          .css({left: x - 32});

        if(dd.getMonth() === 11){
          dd.setMonth(0);
          dd.setFullYear(dd.getFullYear() + 1);
        } else { 
          dd.setMonth(dd.getMonth() + 1);
        }
      }
    }


    if ( days > 365 ) {
      // years
      dd = new Date(from_ms);
      dd.setMonth(0);
      dd.setDate(1);
      dd.setMinutes(0);
      dd.setHours(0);
      dd.setSeconds(0);

      while (dd.getFullYear() <= date_to.substr(0,4)){
        x = (((dd.getTime() - from_ms)/1000) - 86400) * xf;
        
        $('<span class="year" />')
          .html(moment(dd).format('YYYY'))
          .appendTo(el)
          .css({left: x - 32});
        dd.setFullYear(dd.getFullYear() + 1);

      }
    }


  }
  
});
