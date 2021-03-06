/**
* Category.js
*
* @description		:: Stores Categories for the CMS
* @humpback-docs	:: https://github.com/CaliStyle/humpback/wiki/Models#category
* @sails-docs		:: http://sailsjs.org/#!documentation/models
*/

module.exports = {
	description: [
        'Defines a Category for a Page (Route)'
    ].join(' '),

    autoPK: true,
  
    autoCreatedBy: true,
  
    autoCreatedAt: true,
  
    autoUpdatedAt: true,

    reserved: true,
  	
  	permissions: {
      'registered': {
        'create': {action: false,	relation: false},
        'read' 	: {action: true,	relation: false},
        'update': {action: false,	relation: false},
        'delete': {action: false,	relation: false}		
      },
      'public': {
        'create': {action: false,	relation: false},
        'read' 	: {action: true,	relation: false},
        'update': {action: false,	relation: false},
        'delete': {action: false,	relation: false}
      }
  	},

  	attributes: {
  		name: {
  			type: 'string',
        required: true,
        unique: true
  		},
  		routes: {
  			collection: 'Route',
        via: 'categories',
        dominant: true
  		}
  	},

    beforeValidate: [
      function makeLowercase (values, next) {
        
        sails.log.silly('Category.beforeValidate.makeLowercase');
        if(values.name){
            values.name  = values.name.toLowerCase();
        }

        next(null, values);
      }
    ]
}