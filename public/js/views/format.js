/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Format = Backbone.View.extend({
  template : _.template('<ul class="segments">\
<li><a href="#chart" <%= ((format === \'chart\')?\'class="active"\':\'\') %>>Chart</a></li>\
<li><a href="#data" <%= ((format === \'data\')?\'class="active"\':\'\') %>>Data</a></li>\
</ul>'),
  initialize : function(opts) {
    _.bindAll(this, 'render','set');
    this.listenTo(this.model, 'update', this.render);
    this.render();
  },
  events: {
    'click a': 'set'
  },
  render: function() {
    var self = this;
    var data = {
      format: this.model.get('format')
    };
    $(this.el).html(this.template(data));
  },
  set: function(e) {
    e.preventDefault();
    e.stopPropagation();
    var format = $(e.target).attr('href').substr(1);
    this.model.set({
      format: format
    });
  }

});


