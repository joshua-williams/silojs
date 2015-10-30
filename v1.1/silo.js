
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

    this.scope = function(dom){
        if(is_string(dom)) return getFrom(Silo.scope, dom);
        if(!is_element(dom)) return [];
        var parent = dom.parentNode;
        var scope = [];
        while(parent){
            if(!parent) break;

            if(parent.nodeName.match(/silo/i)){
                var className = parent.getAttribute('src');
                if((cls = getFrom(Silo.scope, className))){
                    setTo(scope, className, cls);
                }
            }
            parent = parent.parentNode;
        }
        return scope;
    };

    /**
     * @desc
     * 1. Load Silos
     * 2. Load and instantiate Controllers
     * 3. Load views and includes
     */
    this.init = function(){
        var silos = [];
        if((siloTags = $dom('[silo]'))){
            for(var a= 0, siloTag; siloTag=siloTags[a]; a++){
                var directiveTags = siloTag.find('silo\\:controller,silo\\:include,silo\\:view');
                if(!directiveTags) continue;
                for(var b= 0, dt; dt=directiveTags[b]; b++){
                    switch(dt.element.nodeName.toLowerCase()){
                        case 'silo:include': case 'silo:view':
                            this.loadExternalSource(dt);
                            break;
                        case 'silo:controller':
                            this.initLoadControllers(siloTag);
                            break;
                    }
                }
            }
        }

        (function(){
            for(var a= 0, func; func=Silo.listeners[a]; a++){
                func();
            }
        })();

    };

    this.loadController = function(ctrl, path){
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

    this.loadExternalSource = function(dom){
        (function(dom){
            var nodeName = dom.element.nodeName.toLowerCase();
            var src = dom.attr('src');
            Silo.Loader.load({
                url: src,
                target: dom,
                load: function(html) {
                    var div = document.createElement('div');
                    div.innerHTML = html;

                    this.target.element.parentNode.insertBefore(div, this.element);
                    Silo.View.renderElement(div);
                }
            })
        })(dom);
    };


    this.loadViews = function(ctrl){
        (function(ctrl){
            if(!(views = ctrl.find('silo\\:view, silo\\:include'))){ return false;}
            for(var a= 0, view; view=views[a]; a++){
                if(view.element.nodeName.match(/silo:view/i)){
                    var src = ctrl.path + '/views/' + view.attr('src');
                }else{
                    var src = view.attr('src');
                }
                Silo.Loader.load({
                    url: src,
                    target: {view:view},
                    load: function(r){
                        if(this.statusText !== 'OK'){
                           return this.target.view.remove();
                        }

                        this.target.view.replaceWith(this.responseText)
                       // console.log('load successful');
                       // console.log(this.target.view.attr('src'));
                    }
                })
            }

        })(ctrl);
    }

    this.initLoadControllers = function(silo){
        (function(silo){
            var path = silo.attr('src') || '.';
            if((controllers = silo.find('silo\\:controller'))) {
                for (var a = 0, ctrl; ctrl = controllers[a]; a++) {
                    Silo.loadController(ctrl, path);
                }

            }
        })(silo);
    }
    window.addEventListener('load', function(){
        Silo.init();
    });
}();
