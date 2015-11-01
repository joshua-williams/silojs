
var silolib = ['global','loader','cache','router','view'];
(function(includes){
    for(var a=0, i; i=includes[a]; a++){
        var h = document.querySelector('head');
        var path = document.querySelector("script[src$=silo\\.js]").getAttribute('src').replace(/silo\.js$/, i + '.js');
        s = document.createElement('script');
        s.addEventListener('load', function(){
            var src = this.getAttribute('src').match(/([a-z0-9_\-]+)\.js$/)[1];
            silolib.splice(silolib.indexOf(src),1);
            if(!silolib.length){  Silo.ready(); }
        })
        s.setAttribute('type', 'text/javascript'),
            s.setAttribute('src', path);
        h.appendChild(s);
    }
})(silolib);

var Silo = new function(){
    this.listeners = [];

    this.ready = function(callback){
        if(callback === undefined){
            (function(that){
                for(var a= 0, cb; cb=that.listeners[a]; a++){
                    cb();
                }
            })(this);
        }else if(typeof(callback) === 'function'){
            this.listeners.push(callback);
        }
    };

    this.scope = function(dom,debug){

        if(is_string(dom)) return getFrom(Silo.scope, dom);
        if(is_element(dom)){

            var parent = dom.parentNode;
            var scope = [];
            while(parent){
                if(!parent) break;

                if(parent.nodeName.match(/silo/i)){
                    if(parent.nodeName.toLowerCase() == 'silo:controller'){
                        scope.push(parent);
                    }
                }
                parent = parent.parentNode;
            }
            scope.each = function(func){
                if(!is_function(func)) return;
                for(var a = 0, i; i = this[a]; a++){
                    this[a].className = this[a].getAttribute('src')
                    func.bind(this[a])();
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

        (function(){
            for(var a= 0, func; func=Silo.listeners[a]; a++){
                func();
            }
        })();

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
            if((silo = Silo.getSilo(dom.element))){
                var path = $dom(silo).attr('src') || '.';
            }else{
                var path = '.';
            }
            var src = dom.attr('src').replace('.', '/') + '.js';
            var url = path + '/' + src;
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
        try{
            eval('var ctrl = new ' + script);
            setTo(Silo.scope, className, ctrl);
            Silo.View.renderElement(this.target.dom.element, 'controller');
        }catch(e){
            console.log('Silo Controller Error on '+className+'\nError Message: ' + e.message+'\n')
        }

    };
    this.onErrorController = function(){
        console.log('controller failed to load');
    };

    this.loadControllerBak = function(ctrl, path){
        if (!(src = ctrl.attr('src'))) {
            ctrl.remove();
            return;
        }
        ctrl.path = path;
        var url = path + '/' + src.replace('.','/') + '.js';
        Silo.Loader.load({
            url: url,
            target: {dom:ctrl, path:path},
            load: function(e){
                var dom = this.target.dom;
                var controller = eval('new ' + this.responseText);
                controller.dom = ctrl;
                controller.path = this.target.path;
                if(is_function(controller.construct)){controller.construct(); }
                setTo(Silo.scope, dom.attr('src'), controller);
            }
        })
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
