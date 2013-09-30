/*global Backbone:true, $:true, _:true, App:true, moment: true */
/*global ymd_to_date:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Dataset = Backbone.View.extend({
  base: 0,
  initialize : function(opts) {
    var self = this;
    this.model = opts.model;
    _.bindAll(this, 'initialize', 'render', 'render', 'update', 'scroll', 'onHover');
    
    // temporary els to determine sizes from css
    $(this.el).html('');
    var table = $('<table />').appendTo($(this.el));
    table.append(this.templates.blank());
    this.row_h = table.find('tr:first').height() + 2;
    
    this.listenTo(this.model, 'change', this.update);
    this.listenTo(this.model, 'update', this.update);

    this.render();

    $(window).on('scroll', this.scroll);

  },
  onClose: function() {
    $(window).off('scroll', this.scroll);
    this.stopListening();
  },
  events:{
    'mousemove tbody tr': 'onHover',
    'mouseleave': 'onHover'
  },
  onHover: function(e){
    var date = $(e.currentTarget).data('date');
    if(!date){
      date = false;
    }
    this.model.set('date_cursor', String(date));
  },
  render: function() {

    this.height = $(this.el).height();

    $(this.el).html('');
    this.fill = $('<div class="fill" />').appendTo($(this.el));   
    this.table = $('<table />').appendTo($(this.el));
    this.thead = $('<thead />').appendTo($(this.table));  
    this.tbody = this.table.append('<tbody />');

    // - to allow for header row
    this.limit = Math.floor((this.height - this.thead.height()) / this.row_h) - 2;

    for ( var i = 0; i < this.limit; i ++ ) {
      this.tbody.append(this.templates.blank());
    }

    this.update();
    return this;
  },
  scroll: _.debounce(function(e) {   

    if(this.model.get('format') !== 'data'){
      return;
    }

    var viewport_offset, viewport_top;

    viewport_offset = $(window).scrollTop();
    var total = $(document).height() - $(window).height();
    var pct = (100/total) * $(window).scrollTop();
    this.base = Math.floor(((this.fill_height - ( this.row_h * this.limit)) / this.row_h) * (pct / 100));
    this.update();
  }, 10),
  update: function() {    

    var self = this;

    if(this.model.get('format') === 'data'){
      $(this.el).removeClass('inactive');     
    } else {
      $(this.el).addClass('inactive');
      return;
    }

    var window, values, puts, calls;

    var date_from = this.model.get('date_from');
    var date_to = this.model.get('date_to');

    // get data rows that should be visible

    values = this.model.get('values');
    if (!values || values.length === 0 ){
      return;
    }

    window = _.reject(values, function(x){
      return (x[0] < date_from || x[0] > date_to);
    });
    
    // render

    var h = this.limit * this.row_h;

    if(!window){
      return;
    }

    this.fill_height = (window.length * this.row_h) + this.thead.height();
    
    if ( this.fill_height < h ) {
      this.fill_height = h;
    }

    $('body').css({height: this.fill_height});
    this.fill.css({height: this.fill_height});
    this.table.find('tbody tr').addClass('blank');
    this.table.find('tbody tr td').html('&nbsp;');

    var base = this.base;
    var top = this.base + this.limit - 1;

    var tr = this.table.find('tbody tr:first');

    this.thead.html(this.templates.header());
    
    _.each(
      _.reject(window, function(x,i){return i < base || i > top; }),
      function(x){
        var date = ymd_to_date(String(x[0]));
        var data = {
          date: moment(date).format('YYYY MMM DD'),
          day: moment(date).format('ddd'),
          value: x[1]
        };
        tr.html(self.templates.row(data));
        tr.data('date', x[0]);

        if(data.day === 'Mon'){
          tr.addClass('monday');
        } else {
          tr.removeClass('monday');
        }

        tr = tr.next('tr');
      });


  },
  templates: {
      header: _.template('<tr>\
<td class="date">Date</td>\
<td class="day"></td>\
<td></td>\
<td class="value">Value</td>\
</tr>'),
      blank: _.template('<tr>\
<td class="date">&nbsp;</td>\
<td class="day">&nbsp;</td>\
<td>&nbsp;</td>\
<td class="price">0.00</td>\
</tr>'),
      row: _.template('<td class="date"><%= date %></td>\
<td class="day"><span><%= day %></span></td>\
<td></td>\
<td class="price">$<%= Number(value/100).toFixed(2) %></td>')
  }
});
