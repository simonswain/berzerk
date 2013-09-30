/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Loading = Backbone.View.extend({
  template : _.template('<h3>Loading...</h3>'),
  initialize : function() {
    _.bindAll(this, 'render');
    this.listenTo(this.model, 'change:loading', this.render);
    this.render();
  },
  render: function() {
    var self = this;
    var loading = this.model.get('loading');
    if(!loading){
      $(this.el).fadeOut(250);
      return;
    }
    $(this.el).html(this.template()).show();
  }

});

