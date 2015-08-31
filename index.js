'use strict';

function _getRouteID(req){

  var method = req.method.toLowerCase();
  var uri = req.url;
  var id = new Buffer(method + ':' + uri).toString('base64');

  return id;
}

function _isFilename(url){
  var fileParts = url.split('.');
  if(fileParts > 0){
    return true;
  }
  
  return false;
  
}

function _isRest(url){
  //See if this is a rest call.
  if(!sails.config.blueprints.prefix || sails.config.blueprints.prefix === ''){
    return false;
  }

  if(url.indexOf(sails.config.blueprints.prefix) > -1){
    return true;
  }
  
  return false;

}

module.exports = function (sails) {
 	return { 
 		defaults: {
      routes: {
        'get /admin/cms*': {
          view: 'admin/index'
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

      if (!_.isObject(sails.config.meta)){
        sails.config.meta = { };
      }
      if (!_.isObject(sails.config.permission)){
        sails.config.permission = { };
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
            //If this request is a socket request then we can igonore it.
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

            //console.log(req);

            var routeID = _getRouteID(req);
            
            //console.log(routeID);

            var Route = sails.models[sails.config.permission.routeModelIdentity];

            Route.findOne(routeID)
            .exec(function(err, foundRoute){
              if(err || !foundRoute){
                sails.log.info(routeID, 'does not yet have Metadata, use the CMS to add it, setting to default');                
                sails.config.meta.title = sails.config.humpback.name;
                sails.config.meta.description = '';
                sails.config.meta.image = '';

                return next();
              }
              //console.log(foundRoute);

              var keywords = '';
              sails.config.meta.title = foundRoute.title;
              sails.config.meta.description = foundRoute.description;
              sails.config.meta.image = foundRoute.image;
              
              if(_.isObject(foundRoute.keywords)){
                keywords = _.pluck(foundRoute.keywords, 'text').join(',');
              }else{
                keywords = foundRoute.keywords;
              }
              sails.config.meta.keywords = keywords;

              next();
            });
          }
        ]
      }
    }
  };
};

