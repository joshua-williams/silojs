Silo.Router = new function(){
    this.routes = [];

    this.route = function(param){
        if(param === undefined){
            return this.route.current;
        }
        param = (is_object(param)) ? param : {};
        if(!param.hash  || !is_string(param.hash) || !param.controller || !is_string(param.controller)){return false;}
        this.routes.push(param);
    };

    this.route.current = false;

    this.route.on = function(e){
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
            for(var a= 0, route; route=that.routes[a]; a++){
                if(route.hash === window.location.hash.replace('#','')){
                    if(ctrl = getFrom(Silo.scope, route.controller)){
                        console.log('found route controller')
                        console.log(ctrl)
                    }
                }
            }
        })(this);
    }
    window.addEventListener('load', function(){
        window.addEventListener('hashchange', Silo.Router.hash.change.bind(Silo.Router));
    });
}();


