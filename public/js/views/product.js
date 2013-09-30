/*global Backbone:true, $:true, _:true, App:true */
/*jshint multistr:true */
/*jshint browser:true */
/*jshint strict:false */

App.Views.Product = Backbone.View.extend({
  template : _.template('<% if(products){ print(\'<select name="product">\'); _.each(products, function(x) { print(\'<option value="\' + x.code + \'" \' + ( ( product === x.code ) ? \' selected="selected"\' : \'\' ) + \'>\' + x.title  + \'</option>\'); }); print(\'</select>\'); } %>'),
  initialize : function() {
    _.bindAll(this, 'render', 'set');
    this.render();
  },
  events: {
    'change select': 'set'
  },
  render: function() {
    var self = this; 
    var products = this.model.get('products');
    var product = _.findWhere(product, {slug: this.model.get('product')});


    var data = {
      products: this.model.get('products'),
      product: this.model.get('product')
    };

    // don't trigger changes on selecter when we re-render
    this.stopListening(this.model);
    $(this.el).html(this.template(data));
    this.listenTo(this.model, 'update', this.render);

  },

  set: function(e) {
    var name = $(e.target).attr('name');
    var prop = {};
    prop[$(e.target).attr('name')] = $(e.target).val();
    this.model.set(prop);
  }

});

