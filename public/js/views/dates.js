/*global Backbone:true, $:true, _:true, App:true, moment: true */
/*global ymd_to_s:true, s_to_ymd:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Dates = Backbone.View.extend({
  template : _.template('<select name="from-d"><% for (var i=1; i<31; i++ ) { print (\'<option>\' + zeropad(i) + \'</option>\'); } %></select>\
<select name="from-m"><% for (var i=1; i<13; i++ ) { print (\'<option value="\' + zeropad(i) + \'" >\' + months[i-1] + \'</option>\'); } %></select>\
<select name="from-y"><% for (var i = Number(date_min.substr(0,4)), ii = Number(date_max.substr(0,4)); i<=ii; i++ ) { print (\'<option value="\' + i + \'">\' + i + \'</option>\'); } %></select>\
 &rarr; \
<select name="to-d"><% for (var i=1; i<32; i++) { print (\'<option>\' + zeropad(i) + \'</option>\'); } %></select>\
<select name="to-m"><% for (var i=1; i<13; i++ ) { print (\'<option value="\' + zeropad(i) + \'" >\' + months[i-1] + \'</option>\'); } %></select>\
<select name="to-y"><% for (var i = Number(date_min.substr(0,4)), ii = Number(date_max.substr(0,4)); i<=ii; i++ ) { print (\'<option value="\' + i + \'">\' + i + \'</option>\'); } %></select>'),
  initialize : function() {
    _.bindAll(this, 'render', 'update', 'setDates');
    this.listenTo(this.model, 'update', this.render);
    this.listenTo(this.model, 'range', this.render);
    this.render();
  },
  events: {
    'change select': 'setDates'
  },
  update: function() {
    var self = this;

    if ( this.model.get('date_from') ) {
      this.$('[name=from-y]').val( this.model.get('date_from').substr(0,4) );
      this.$('[name=from-m]').val( this.model.get('date_from').substr(4,2) );
      this.$('[name=from-d]').val( this.model.get('date_from').substr(6,2) );
    }

    if ( this.model.get('date_to') ) {
      this.$('[name=to-y]').val( this.model.get('date_to').substr(0,4) );
      this.$('[name=to-m]').val( this.model.get('date_to').substr(4,2) );
      this.$('[name=to-d]').val( this.model.get('date_to').substr(6,2) );
    }

  },
  render: function() {
    var self = this;

    var data = {
      months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      date_min: this.model.get('date_min'),
      date_max: this.model.get('date_max'),
      date_from: this.model.get('date_from'),
      date_to: this.model.get('date_to')
    };

    if(!data.date_min || ! data.date_max){
      $(this.el).html('');
      return;
    }

    $(this.el).html(this.template(data));
    this.update();
  },
  setDates: function() {
    var tmp;
    var dateFrom = this.$('[name=from-y]').val() + this.$('[name=from-m]').val() + this.$('[name=from-d]').val();
    var dateTo = this.$('[name=to-y]').val() + this.$('[name=to-m]').val() + this.$('[name=to-d]').val();

    if (dateFrom > dateTo){
      tmp = dateTo;
      dateTo = dateFrom;
      dateFrom = tmp;
    }

    this.model.set({
      date_from: dateFrom,
      date_to: dateTo
    });
  }

});
