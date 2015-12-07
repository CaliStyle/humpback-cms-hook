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
         * Title of this Route
         */
        byline: {
            type: 'string'
        },

        /**
         * Url friendly Title of this Route
         */
        slug: {
            type: 'string',
            unique: true,
            index: true
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
         * Categories
         */
		categories: {
			collection: 'Category',
            via: 'routes'
		},

        /*
         * The Status of the Route
         */
        status: {
            type: 'string',
            enum: ['draft','published','trash']
        },

		/*
         * TODO, make route publishable at datetime
         */
        publishAt: {
            type: 'datetime'
        },

        /*
         * Route is in trash.
         */
        trash: {
            type: 'boolean',
            defaultsTo: false,
        },

        /*
         * When Route was last moved to Trash
         */
        trashAt: {
            type: 'datetime'
        }

	},
	
	beforeValidate: [
		function handleSlug(values, next){
			sails.log.verbose('Route.beforeValidate.handleSlug');
            if(values.title){
                values.slug  = values.title.slug();
            }
            next(null, values);
		}
	],

    beforeCreate: [
        function handleSlug(values, next){
            sails.log.verbose('Route.beforeCreate.handleSlug');
            if(!values.slug){
                return next(null, values);
            }

            Route.find({slug: {like: values.slug+'%'}})
            .exec(function(err, routes){
                if(routes.length > 0){
                    values.slug = values.slug+'-'+routes.length;
                }
                next(err, values);
            });
        }
    ],

    beforeUpdate: [
        function handleSlug(values, next){
            sails.log.verbose('Route.beforeUpdate.handleSlug');
            if(!values.slug){
                return next(null, values);
            }

            Route.find({id: {'!': values.id }, slug: {like: values.slug+'%'} })
            .exec(function(err, routes){
                if(routes.length > 0){
                    values.slug = values.slug+'-'+routes.length;
                }
                next(err, values);
            });
        },
        function handleTrash(values, next){
            sails.log.silly('Route.beforeUpdate.handleTrash');
            if(values.trash){
               values.trashAt = new Date();
               values.status = 'trash';
            }
            next(null, values);
        }
    ]
  
});