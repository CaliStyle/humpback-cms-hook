'use strict';

//var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
/*
function _getRouteID(req){

  var method = req.method.toLowerCase();
  var uri = req.url;
  var id = new Buffer(method + ':' + uri).toString('base64');

  return id;
}
*/

function _isFilename(url){
  //console.log(url);
  var fileParts = url.split('.');
  if(fileParts.length > 1){
    return true;
  }
  
  return false;
  
}

function _isRest(url){
  //console.log(url);
  //See if we can tell if this is a rest call.
  if(!sails.config.blueprints.prefix || sails.config.blueprints.prefix === ''){
    return false;
  }
  //If has an index of the prefix then we can think it's a rest call
  if(url.indexOf(sails.config.blueprints.prefix) > -1){
    return true;
  }
  
  return false;

}

module.exports = function (sails) {
 	return { 
 		defaults: {
      routes: {
        'get /admin/cms': {
          view: 'admin/index',
          defaultPermissions: ['admin']
        },
        'get /admin/cms/*': {
          view: 'admin/index',
          defaultPermissions: ['admin']
        }
      }
    },

		configure: function () {
      
      if (!_.isObject(sails.config.humpback)){
      	sails.config.humpback = { };
      }
      if(!_.isObject(sails.config.humpback.barnacles)){
        sails.config.humpback.barnacles = { };
      }
      sails.config.humpback.barnacles.cms = true;

      if (!_.isObject(sails.config.permission)){
        sails.config.permission = { };
      }

      if (!_.isObject(sails._routeCache)){
        sails._routeCache = { };
      }

      if(!sails.config.permission.routeModelIdentity){
        sails.config.permission.routeModelIdentity = 'route';
      }

     
    },
		initialize: function (next) {
			var err, eventsToWaitFor = [];
      
      //wait for orm hook to be loaded
      if (sails.hooks.orm) {
        eventsToWaitFor.push('hook:orm:loaded');
      }else{
        err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "orm" hook- cannot load the "humpback" hook without it!';
        return next(err);
      }

      //wait for pub sub hook to be loaded
      if (sails.hooks.pubsub) {
        eventsToWaitFor.push('hook:pubsub:loaded');
      }else{
        err = new Error();
        err.code = 'E_HOOK_INITIALIZE';
        err.name = 'Humpback Hook Error';
        err.message = 'The "humpback" hook depends on the "pubsub" hook- cannot load the "humpback" hook without it!';
        return next(err);
      }

      //apply validation hook
      sails.after(eventsToWaitFor, function() {
        
        var RouteModel = sails.models[sails.config.permission.routeModelIdentity];

        if (!RouteModel) {
          err = new Error();
          err.code = 'E_HOOK_INITIALIZE';
          err.name = 'Humpback Hook Error';
          err.message = 'Could not load the humpback hook because `sails.config.humpback.routeModelIdentity` refers to an unknown model: "'+sails.config.permissions.routeModelIdentity+'".';
          if (sails.config.permission.routeModelIdentity === 'route') {
            err.message += '\nThis option defaults to `route` if unspecified or invalid- maybe you need to set or correct it?';
          }
          return next(err);
        }
        // It's very important to trigger this callback method when you are finished
  		  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  		  sails.emit('hook:humpback:cms:loaded');
        next();
      });
          
		},

    /**
     * These route bindings act like policy abstractions
     * They occur before Blueprints and Custom Routes
     */
    routes: {
      before: {
        'get /*': [
          function cms (req, res, next){
            res.locals.meta = {};
            //If this request is a socket request then we can igonore it and let the route policy handle it.
            if(req.isSocket){
              return next();
            }
            //If this request is for a non html file, we can ignore it.
            if(_isFilename(req.url)){
              return next();
            }
            if(_isRest(req.url)){
              return next();
            }

            var RouteService = sails.services.routeservice;

            RouteService.findTargetRoute(req)
              .then(function (route){
                sails.log.silly(route);
                sails.log.verbose('ROUTE:', req.route);
                
                if(!req.route.title){
                  sails.log.verbose(req.routeId, req.method.toLowerCase(), req.url, 'does not yet have a Title, use the CMS to add it, setting default...');  
                  res.locals.meta.title = sails.config.humpback.name;
                }else{
                  res.locals.meta.title = req.route.title;
                }

                if(!req.route.description){
                  sails.log.verbose(req.routeId, req.method.toLowerCase(), req.url, 'does not yet have a Description, use the CMS to add it');  
                  res.locals.meta.description = '';
                }else{
                  res.locals.meta.description = req.route.description;
                }

                if(!req.route.image){
                  sails.log.verbose(req.routeId, req.method.toLowerCase(), req.url, 'does not yet have an Image, use the CMS to add it');  
                  res.locals.meta.image = '';
                }else{
                  res.locals.meta.image = req.route.image;
                }

                if(!req.route.keywords){
                  sails.log.verbose(req.routeId, req.method.toLowerCase(), req.url, 'does not yet have Keywords, use the CMS to add them');  
                  res.locals.meta.keywords = '';
                }else{
                  var keywords;
                  if(_.isObject(req.route.keywords)){
                    keywords = _.pluck(req.route.keywords, 'text').join(',');
                  }else{
                    keywords = req.route.keywords;
                  }
                  res.locals.meta.keywords = keywords;
                }

                if(req.options.routeUnlocked){
                  //Assume that this is handled by Model Permissions
                  //Or that this route is public;
                  return next();
                }

                var options = {
                  verb: req.method,
                  route: req.route,
                  user: req.user
                };

                RouteService.findUserRouteRoles(options)
                  .then(function (roles) {
                    sails.log.verbose('RoutePolicy:', roles.length, 'roles grant', req.method, 'on', req.route.uri);
                    if (!roles || roles.length === 0) {
                      if(req.route.redirect){
                        return res.redirect(req.route.redirect);
                      }else{
                        return res.forbidden({ error: RouteService.getErrorMessage(options)},'403');
                      }
                    }
                    next();
                  });
              });
          }
        ]
      }
    }
  };
};

