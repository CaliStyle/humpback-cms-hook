/**
* Route.js
*
* @description    :: Stores the Route 
* @humpback-docs  :: https://github.com/CaliStyle/humpback/wiki/Models#route
* @sails-docs     :: http://sailsjs.org/#!documentation/models
*/

String.prototype.slug = function() {
    var title = this;
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-');
};


var _ = require('lodash');
var _super = require('humpback-hook/api/models/Route');

_.merge(exports, _super);
_.merge(exports, {

  /**
   * Extend the Model
   * https://github.com/CaliStyle/humpback-hook/blob/master/api/models/Route.js
   * @exmaple: 
   * attributes : { 
   *	foo : {type: 'string'} 
   * }, 
   * bar: function(values, next){ 
   *	next(); 
   * }
   */
	attributes: {
		/**
         * Title of this Route
         */
        title: {
            type: 'string'
        },

        /**
         * Url friendly Title of this Route
         */
        slug: {
            type: 'string'
        },
        
        /**
         * Description of this Route
         */
        description: {
            type: 'string'
        },

        /**
         * Keywords for this Route
         */
        keywords: {
            type: 'array',
            defaultsTo: []
        },

        /**
         * the Featured Image of this route
         */
        image: {
            type: 'string'
        },
        /**
         * optional content for this route
         */
        content: {
            type: 'string'
        },

        /**
         * Category
         */
		category: {
			model: 'Category'
		},

		/*
         * TODO, make route publishable at datetime
         */
        publishAt: {
            type: 'datetime'
        }

	},
	
	beforeValidate: [
		function handleSlug(values, next){
			if(values.title){
                values.slug  = values.title.slug();
            }
            next(null, values);
		}
	]
  
});