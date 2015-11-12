
var silolib = ['global','loader','cache','router','view','bind'];
(function(includes){
    for(var a=0, i; i=includes[a]; a++){
        var h = document.querySelector('head');
        var path = document.querySelector("script[src$=silo\\.js]").getAttribute('src').replace(/silo\.js$/, i + '.js');
        s = document.createElement('script');
        s.addEventListener('load', function(){
            var src = this.getAttribute('src').match(/([a-z0-9_\-]+)\.js$/)[1];
            silolib.splice(silolib.indexOf(src),1);
            if(!silolib.length){
                Silo.config('ready', true);
                Silo.ready();
            }
        })
        s.setAttribute('type', 'text/javascript'),
            s.setAttribute('src', path);
        h.appendChild(s);
    }
})(silolib);

var Silo = new function(){
    this.listeners = [];
    this.queue = [];
    this.config = function(n,v){
        return (function(){
            if(is_string(n)){
                if(v != undefined) return Silo.config[n] = v;
                return Silo.config[n];
            }else if(is_object(n)){
                for(key in n){
                    Silo.config(key, n[key]);
                };
            }
        })();
    }
    this.config.initialized = false;
    this.config.ready = false;

    this.ready = function(callback){
        if(typeof(callback) === 'function'){
           return this.listeners.push(callback);
        }else if(callback === undefined){
            if(Silo.config('initialized')){
                (function(){
                    for(var a= 0, cb; cb=Silo.listeners[a]; a++){
                        cb();
                    }
                })();
            }
        }
    };

    this.scope = function(dom,debug){
        if(!dom) return null;
        if(is_string(dom)) return getFrom(Silo.scope, dom);
        if(is_element(dom)){

            var parent = dom.parentNode;
            var scope = [];
            while(parent){
                if(!parent) break;

                if(parent.nodeName.match(/silo/i)){
                    if(parent.nodeName.toLowerCase() == 'silo:controller'){
                        parent.controller = getFrom(Silo.scope, parent.getAttribute('src'));
                        scope.push(parent);
                    }
                }
                parent = parent.parentNode;
            }
            scope.push(window);
            scope.each = function(func){
                if(!is_function(func)) return;

                for(var a = 0, i; i = this[a]; a++){
                    if(is_element(this[a])){
                        this[a].className = this[a].getAttribute('src');
                    }

                    if(func.bind(this[a])() === false) break;
                }
            }
            return scope;
        }else{
            return [];
        }
    };

    this.getSilo = function(element){
        while(element.parentNode){
            element = element.parentNode;
            if(!element.hasAttribute('silo')) continue;
            return element;
        }
    }

    this.init = function(){
        var silos = [];
        if((siloTags = $dom('[silo]'))){
            for(var a= 0, siloTag; siloTag=siloTags[a]; a++){
                Silo.View.renderElement(siloTag.element);
            }
        }
        this.config('initialized', true);
        this.ready();
    };

    this.loadController = function(ctrl){
        if(is_string(ctrl)){

        }else if(is_object(ctrl)){
            if(is_element(ctrl.element)){
                var dom = $dom(ctrl.element);
            }else if(is_element(ctrl)){
                var dom = $dom(ctrl);
            }else{
                return false;
            }
            /**
             * prevent duplicate requests
             * queue controllers in case same resource called
             * from an include or view before initial request loads
             */
            if(Silo.queue.indexOf(ctrl.attr('src')) != -1) return false;

            if((silo = Silo.getSilo(dom.element))){
                var path = $dom(silo).attr('src') || '.';
            }else{
                var path = '.';
            }
            var src = dom.attr('src').replace('.', '/') + '.js';
            var url = path + '/' + src;

            Silo.queue.push(ctrl.attr('src'));
            Silo.Loader.load({
                url: url,
                target: {dom:dom},
                load: Silo.onLoadController,
                error: Silo.onErrorController
            })

        }
    };

    this.onLoadController = function(script){
        var className = this.target.dom.attr('src');
        Silo.queue.splice(Silo.queue.indexOf(className),1);
        eval('var ctrl = new ' + script);
        ctrl.dom = this.target.dom;
        var silo = $dom(Silo.getSilo(ctrl.dom.element));
        ctrl.path = (silo && silo.attr('src')) ? silo.attr('src') : '.';
        setTo(Silo.scope, className, ctrl);
        Silo.View.renderElement(this.target.dom.element, 'controller');
        if(is_function(ctrl.construct)){
            ctrl.construct();
        }
        /**
         * After controller construct dispatch route event
         */
        for(var a= 0, route; route=Silo.Router.routes[a]; a++){
            if(route.controller === ctrl){
                var hash = window.location.hash.replace('#','');
                if(route.hash === hash){
                    if(is_function(route.callback)){
                        route.callback.bind(ctrl)();
                    }
                }
            }
        }
    };
    this.onErrorController = function(){
        console.log('controller failed to load');
    };

    this.initLoadControllers = function(silo){
        (function(silo){
            var path = silo.attr('src') || '.';
            if((controllers = silo.find('silo\\:controller'))) {
                for (var a = 0, ctrl; ctrl = controllers[a]; a++) {
                    Silo.loadController(ctrl, path);
                }

            }
        })(silo);
    };

    window.addEventListener('load', function(){
        Silo.init();
    });
}();
