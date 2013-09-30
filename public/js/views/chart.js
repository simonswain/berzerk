/*global Backbone:true, $:true, _:true, App:true */
/*global ymd_to_s:true, s_to_ymd:true, sensible */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Chart = Backbone.View.extend({
  template: _.template('<div class="selector">\
 <div class="product"></div>\
 <div class="format"></div>\
<div class="help"></div>\
 <div class="dates"></div>\
</div>\
<div class="canvas">\
 <div class="overview"></div>\
 <div class="summary"></div>\
 <div class="dataset"></div>\
 <div class="highlight"></div>\
 <div class="valuerange"></div>\
 <div class="datachart"></div>\
 <div class="interactive"></div>\
 <div class="daterange"></div>\
</div>'),
  initialize : function(opts) {
    var self = this;
    this.model = opts.model;
    _.bindAll(this, 'initialize', 'onClose', 'render');
    
    this.el = opts.el;
    this.selection = opts.selection;
    
    this.render();
 
    $(window).bind('resize', _.debounce(function() {
      self.render();
    }, 250));


  },
  onClose: function(){
    this.r.remove();
  },
  attrs: App.attrs,
  render: function() {
    $(this.el).html(this.template());

    _.each(this.views, function(x){
      x.close();
      x = null;
    });

    this.el.css({
      'width': this.el.width() - (this.el.offset().left * 2),
      'height': $(window).height() - (this.el.offset().top)
    });

    var w = this.el.width();
    var h = this.el.height();

    var ch = $(window).height() - $('.canvas').offset().top;
    $('.canvas').css({height: ch});

    this.el.find('.overview').css({'width': w});
    this.el.find('.daterange').css('width', w);
    
    var dt = $('.overview').height();
    var hd = ch - dt - 12;
    var hc = ch - dt - $('.daterange').height() - 2;

    this.el.find('.dataset').css({'top': dt, 'width': w, 'height': hd});

    this.el.find('.highlight').css({'top': dt, 'width': w, 'height': hc});
    this.el.find('.datachart').css({'top': dt, 'width': w, 'height': hc});
    this.el.find('.interactive').css({'top': dt, 'width': w, 'height': hc});
    this.el.find('.valuerange').css({'top': dt, 'width': w, 'height': hc});
    // selector

    App.views.product = new App.Views.Product({
      el: this.el.find('.selector .product'),
      model: this.selection
    });

    App.views.dates = new App.Views.Dates({
      el: this.el.find('.selector .dates'),
      model: this.selection
    });


    App.views.help = new App.Views.Help({
      el: this.el.find('.selector .help'),
      model: this.selection
    });

    App.views.format = new App.Views.Format({
      el: this.el.find('.selector .format'),
      model: this.selection
    });

    App.views.overview = new App.Views.Overview({
      el: this.el.find('.overview'),
      model: this.selection
    });

    App.views.chart = new App.Views.Datachart({
      el: this.el.find('.datachart'),
      model: this.selection
    });

    App.views.interactive = new App.Views.Interactive({
      el: this.el.find('.interactive'),
      model: this.selection
    });

    App.views.highlight = new App.Views.Highlight({
      el: this.el.find('.highlight'),
      model: this.selection
    });

    App.views.daterange = new App.Views.Daterange({
      el: this.el.find('.daterange'),
      model: this.selection
    });

    App.views.valuerange = new App.Views.Valuerange({
      el: this.el.find('.valuerange'),
      model: this.selection
    });

    App.views.dataset = new App.Views.Dataset({
      el: this.el.find('.dataset'),
      model: this.selection
    });

  }
});
