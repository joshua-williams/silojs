Silo.Router = new function(){
    this.routes = [];
    this.eventListeners = [];

    this.route = function(param){
        if(!is_object(param)) return false;
        if(!is_string(param.hash)) return false;
        if(!is_function(param.callback)) return false;
        if(is_string(param.controller)){
            param.controller = getFrom(Silo.scope, param.controller);
        }
        this.routes.push(param);
        return this;
    };

    this.route.current = false;

    this.route.on = function(e,f){
        switch(e){
            case 'route':

                break;
        }
    };

    this.hash = function(){
        return window.location.hash.replace('#','');
    };

    this.hash.change = function(e){
        (function(that){
            console.log('initial route')
            for(var a= 0, route; route=that.routes[a]; a++){
                if(route.hash === window.location.hash.replace('#','')){
                    var scope = false;
                    if(!is_function(route.callback)) continue;
                    if(is_object(route.controller)){
                        scope = route.controller;
                    }else if(is_string(route.controller)){
                        var ctrl = getFrom(Silo.scope, route.controller);
                        if(is_object(ctrl)){
                            scope = ctrl;
                        }
                    }
                    route.callback.bind((scope||route))()
                }
            }
        })(this);
    }
    window.addEventListener('load', function(){
        window.addEventListener('hashchange', Silo.Router.hash.change.bind(Silo.Router));
    });
}();


