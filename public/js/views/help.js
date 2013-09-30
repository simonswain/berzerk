/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Help = Backbone.View.extend({
  template : _.template('<ul class="toggle">\
<li><a href="#help" class="flipper <%= ((active)?\'active\':\'\') %>">Help</a></li>\
</ul>'),
  panel : _.template('<p>Select a Product using the dropdowns at the top left</p>\
<p>Select date ranges from the dropdowns to the right</p>\
<p>The top chart shows you an overview the complete history of your selected product</p>\
<p>Drag the light blue edges of the date range in the overview to change dates</p>\
<p>Drag the middle of the overview date range to move it around</p>\
<p>Drag the large chart to move around</p>\
<p>Use the mousewheel to zoom the date range in and out on either chart</p>\
<p>Click the Chart/Data button or press c/d to switch views</p>\
<p>Use +/-, PgUp/PgDn, &uarr; &darr; &larr; &rarr; to navigate</p>\
<a href="#help" class="close">&times;</a>'),
  initialize : function() {
    _.bindAll(this, 'render','set');
    this.listenTo(this.model, 'change:help', this.render);
    this.render();
  },
  events: {
    'click a': 'set'
  },
  render: function() {
    var self = this;
    var data = {
      active: this.model.get('help')
    };

    $(this.el).html(this.template(data));

    if(!data.active){
      if($('.help-overlay').length === 0){
        return;
      }
      $('.help-overlay').fadeOut(125, function(){
        $('.help-overlay').remove();
      });
      return;
    }

    var x = $('<div />')
      .addClass('help-overlay')
      .appendTo($('body'))
      .html(this.panel)
      .hide()
      .on('click', this.set);
    
    x.css({left: ($(window).width()/2) - (x.width()/2)});
    x.fadeIn(125);
    
  },
  set: function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.model.set({
      help: (!this.model.get('help'))
    });
  }

});
