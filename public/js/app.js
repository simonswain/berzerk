/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

$( function () {
  App.init();
});

var products = [{
  code: 'example-one',
  title: 'Example One',
  uri: '/data/example-one',
  style: 'settle-volume'
}];

Backbone.View.prototype.close = function(){
  this.stopListening();
  if (this.onClose){
    this.onClose();
  }
  this.remove();
};

var App = {
  el: null,
  Models: {},
  Views: {},
  router: null,
  overview: null,
  selection: null,
  cache: {},
  views: {},
  init: function() {
    this.router = new App.Router();

    this.selection = new App.Models.Selection({
      products: products,
      product: 'example-one'
    },{
      router: App.router
    });

    this.chart = new App.Views.Chart({
      el: $('.app'),
      selection: this.selection
    });

    var pushState = !!(window.history && window.history.pushState);

    Backbone.history.start({
      pushState: pushState,
      hashChange: !pushState ? true : false
    });

    $(window).on("click", "a:not([data-bypass])", function(e) {
      var href = $(this).attr("href");
      var protocol = this.protocol + "//";
      if (href.slice(0, protocol.length) !== protocol) {
        e.preventDefault();
        App.router.navigate(href, {trigger:true});
      }
    });

  },
  attrs: {
    overview_cursor: {stroke: '#f00', fill:'#f00', opacity: 0.25},
    day_cursor: {stroke: '#ff0', fill:'#ff0', opacity: 0.5},
    value: {stroke: '#316698', fill: false, 'stroke-width':1.5},
    year_label: {stroke: false, fill: '#aaa', 'font-size': '10px', 'text-anchor':'start'},

    text: {stroke: false, fill: '#aaa'},
    label: {stroke: false, fill: '#666', 'font-size': '10px', 'text-anchor':'start'},
    hover: {stroke: false, fill: '#666', 'font-size': '11px'},
    hover_date: {stroke: false, fill: '#666', 'font-size': '11px', 'font-weight':'bold'},

    point:{fill: '#369', stroke: false},
    scale: {stroke:'#ddd', fill: false, 'stroke-width':1, opacity: 0.5},
    month: {stroke:'#ddd', fill: false, 'stroke-width':1, opacity: 0.6},
    year: {stroke:'#ccc', fill: false, 'stroke-width':2, opacity: 0.6},

    weekend: {stroke: false, fill:'#ddd', opacity: 0.2}
  }
};

App.Router = Backbone.Router.extend({
  initialize: function() {
    this.bind( "all", this.change );
  },
  change: function(e) {
  }
});
