/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Valuerange = Backbone.View.extend({
  template : _.template(''),
  els: {},
  g: null,
  initialize : function(opts) {

    var self = this;

    _.bindAll(this, 'initialize', 'onClose', 'render');
    this.render();

    this.listenTo(this.model, 'update', this.render);
    this.listenTo(this.model, 'change:visible_value_min', this.render);
    this.listenTo(this.model, 'change:visible_value_max', this.render);

  },
  onClose: function() {
    this.stopListening();
  },
  render: function() {
    var self = this;

    if(this.model.get('format') === 'chart'){
      $(this.el).show();
    } else {
      $(this.el).hide();
      return;
    }

    var value_min = this.model.get('visible_value_min');
    var value_max = this.model.get('visible_value_max');

    if (value_min === null || value_max === null){
      return;
    }

    value_min = Number(value_min);
    value_max = Number(value_max);

    var el = $(this.el);

    var width = $(this.el).width();

    var range = value_max - value_min;
    var offset = -1 * value_min;

    var height = this.height = el.height();

    var yf = this.yf = height / range;

    el.html(this.template());

    if ( value_min === value_max ) {
      $('<span />')
        .addClass('value')
        .html(value_min)
        .css({top: (height/2) - 10})
        .appendTo(el);
      return;
    }

    this.offsetY = $(this.el).offset().top;
    this.els.cursor = this.$('.cursor');

    var format = function(x){
      if(self.model.get('style') === 'values'){
        return x.toFixed(2);
      }
      if(self.model.get('style') === 'interregional'){
        return x.toFixed(0);
      }
      return '$' + (x/100).toFixed(2);
    };

    var nice;

    // max value
    $('<span class="primary" />')
      .html(format(value_max))
      .addClass('value')
      .css({top: 2})
      .appendTo(el);

    if ( value_min < 0 ) {
      // zero line
      $('<span class="primary" />')
        .addClass('value')
        .html(format(0))
        .css({top: height - (offset*yf) - 12})
        .appendTo(el);
    }

    // min value
    $('<span class="primary" />')
      .addClass('value')
      .html(format(value_min))
      .css({top: height - ((value_min + offset) * yf) - 16})
      .appendTo(el);

    // positive and negative half values

    if ( value_max > 0 && value_min < 0 ) {
      $('<span />')
        .addClass('value')
        .html(format(value_max/2))
        .css({top: height - (((value_max/2) + offset) * yf) - 10})
        .appendTo(el);

      $('<span />')
        .addClass('value')
        .html(format(value_min/2))
        .css({top: height - (((value_min/2) + offset) * yf) - 10})
        .appendTo(el);

    } else {
      $('<span />')
        .addClass('value')
        .html(format(value_min + (range*0.75)))
        .css({top: height - ((value_min + (range * 0.75) + offset) * yf) -10})
        .appendTo(el);

      $('<span />')
        .addClass('value')
        .html(format(value_min + (range*0.5)))
        .css({top: height - ((value_min + (range * 0.5) + offset) * yf) - 10})
        .appendTo(el);

      $('<span />')
        .addClass('value')
        .html(format(value_min + (range*0.25)))
        .css({top: height - ((value_min + (range * 0.25) + offset) * yf) - 10})
        .appendTo(el);
    }

  }

});
