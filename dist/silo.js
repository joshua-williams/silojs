var gettype = function(v){ 
	if(is_array(v)){return 'array';} 
	if(is_object(v)){return 'object';} 
	if(is_numeric(v)){return 'number';} 
	if(is_function(v)){return 'function';} 
	return false;}
var isset = function(v, scope, _default) { var parts = v.split('.'); var scp = (scope) ? scope : window; for(z in parts) { var part = parts[z]; if(scp[part] == undefined){return _default;} scp = scp[part]; } return scp;};
var is_string = function(v){return (typeof(v)=='string')?true:false;}
var is_array = function(v){return(Object.prototype.toString.call(v)=='[object Array]');}
var is_object = function(v){return(Object.prototype.toString.call(v)=='[object Object]');}
var is_element = function(v){return Object.prototype.toString.call(v).trim().match(/html(?:[a-z]+)?element/i);}
var is_input = function(v){return(Object.prototype.toString.call(v)=='[object HTMLInputElement]');}
var is_textarea = function(v){return(Object.prototype.toString.call(v)=='[object HTMLTextAreaElement]');}
var is_select = function(v){return(Object.prototype.toString.call(v)=='[object HTMLSelectElement]');}
var is_numeric = function(v){ switch(typeof(v)){ case 'number': return true; case 'string': return v.match(/^[0-9]+$/); default: return false;}}
var is_function = function(v){return (typeof(v)=='function')?true:false};
var in_array = function(val, obj){ if(typeof(obj)!='object') return false; for(a in obj){ if(obj[a]==val) return true; } return false; }
var array_merge = function(arr1, arr2){ for(key in arr2){arr1[key]=arr2[key]} return arr1;}
var array_remove = function(a, idx){var r=new Array(); for(i in a){if(i!=idx){r.push(a[i]);}}return r;}
var trim = function(s){var l=/^\s+/, t=/\s+$/; if(l.test(s)){ s = s.substr(s.search(l));} if(t.test(s)){s = s.substr(0,s.search(t));} return s;}
var $dom = function(v, asDom, parent) {
    var dom = function(e){
        this.element = e;
        this.attr = function(k,v){
            if(k&&v===undefined){return this.element.getAttribute(k)}
            if(k&&v!==undefined){this.element.setAttribute(k,v);}
        };
        this.val = function(k,v){
            if(!is_input(this.element) && !is_select(this.element) && !is_textarea(this.element)){return null;}
            if(v===undefined){return this.element.value;}
            this.element.setAttribute(k,v);
        };
        this.html = function(html){
            if(html === undefined){
                return this.element.innerHTML;
            }
            this.element.innerHTML = html;
        }

        this.append = function(dom){
            if(is_string(dom)){
                var div = document.createElement('div');
                div.innerHTML = dom;
                this.element.appendChild(div);
            }else if (is_object(dom) && is_element(dom.element)){
                this.element.appendChild(dom.element);
            }
        }

        this.replaceWith = function(v){
            if(is_string(v)){
                return (function(html, dom){
                    var div = document.createElement('div');
                    div.innerHTML = v;
                    dom.element.parentNode.insertBefore(div, dom.element);
                    dom.element.remove();
                    return div;
                })(v,this)
            }else if(is_element(v)){
            	if(!this.element.parentNode){
            		this.element.innerHTML = v.innerHTML;
            		return v;
            	}
                this.element.parentNode.insertBefore(v, this.element);
                this.element.parentNode.removeChild(this.element)
                return v;
            }
        };

        this.remove = function(){
            var parent = this.element.parentNode;
            if(!parent) return null;
            parent.removeChild(this.element);
        }
        this.find = function(v){
            return (function(v,e){
                return $dom(v, false, e);
            })(v,this.element);
        };
    }

    if(is_string(v)){
        parent = parent || document;
        var elements = parent.querySelectorAll(v);
        if(!elements) return false;
        if(asDom){ return elements; }
        var rtn = [];
        for(var a= 0, e; e=elements[a]; a++){
            rtn.push(new dom(e))
        }
        return rtn;
    }else if(is_element(v)){
        return new dom(v)
    }
}
function getFrom(obj,key,_default){
    switch(typeof(obj)){
        case 'object':case 'function': break;
        default: return _default || null;
    }
    var parts = key.split('.');
    if(parts.length == 1){
        if(obj.hasOwnProperty(parts[0])){ return obj[parts[0]]; }
        return _default || null;
    }

    for(var a=0, k; k=parts[a]; a++){
        if(a === parts.length - 1){
            if(obj.hasOwnProperty(k)) return obj[k];
            return _default || null;
        }else{
            if(!obj.hasOwnProperty(k)) return _default || null;
            obj = obj[k];
        }
    }
}
/**
 *
 * @param o [object|array] - the source
 * @param k [string] dot seperated object path reference
 * @param v [mixed] the value
 */
function setTo(o,k,v){
    return (function(origin,k,v){
        switch(typeof(origin)){
            case 'object':case 'function': break;
            default: return null;
        }
        if(!is_string(k)){return null;}
        var o = origin;
        var keys = k.split('.');
        if(keys.length === 1){
            origin[keys[0]] = v;
            return o;
        }
        for(var a= 0, key; key=keys[a]; a++){
            if(!o.hasOwnProperty(key) || (typeof(o[key]) != 'object')){o[key]={};}
            if((a+1) == keys.length){
                o[key] = v;
            }else{
                o = o[key];
            }
        }
    })(o,k,v);
}
function html_entity_decode(html){
    return html.replace(/\&lt\;/g,'<').replace(/\&gt\;/g,'>');
}
;var Silo = new function(){
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

            var parent = dom;
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
    };
    /**
     *  @desc - Returns the object that contains the variable if found
     */
    this.getParentFromScope = function (variable, scope){
        return (function(variable, scope){
            var value = null;
            scope.each(function(){
                if(is_element(this)){
                    var ctrl = getFrom(Silo.scope, this.className);
                    if(!ctrl) return true;              // continue scope each loop
                    value = getFrom(ctrl, variable);
                    if(value === null) return true;     // continue scope each loop
                    var propertyPath =(this.className + '.' + variable).replace(/\.[\w]+$/,'');
                    value = getFrom(Silo.scope, propertyPath);
                    return false;
                }else{
                    value = getFrom(this, variable);
                    if(value === null) return true;     // continue scope each loop
                    value = this;
                    return false;
                }
            });
            return value;
        })(variable, scope);
    };

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

    this.loadController = function(ctrl, className){
        if(is_string(ctrl)){
        	this.Loader.load({
        		url: ctrl.replace(/\./g,'/') + '.js',
        		target:{className:className},
        		load: function(r){
        			eval('var ctrl = new ' + r);
        			ctrl.parent = false;
        			if(this.target.className){
        				setTo(Silo.scope, this.target.className, ctrl);
        				// Set the controller parent object
        				if(this.target.className.match(/\.[\w]+$/,'')){
        					parentClassName = this.target.className.replace(/\.[\w]+$/,'');
        					ctrl.parent = getFrom(Silo.scope, parentClassName);
        				}
        			}
        			if(is_function(getFrom(ctrl,'construct'))) ctrl.construct();
        		},
        		error: function(r){
        			console.log('failed to load controller');
        		}
        	});
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
                var path = Silo.config('path') || '.';
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
        ctrl.parent = false;
        ctrl.dom = this.target.dom;
        var silo = $dom(Silo.getSilo(ctrl.dom.element));
        ctrl.path = (silo && silo.attr('src')) ? silo.attr('src') : '.';
        setTo(Silo.scope, className, ctrl);
        // Set the controller parent object
        if(className.match(/\.[\w]+$/)){
        	var parentClassName = className.replace(/\.[\w]+$/,'');
        	ctrl.parent = getFrom(Silo.scope, parentClassName)
        }
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
;Silo.Loader = new function(){
    /**
     *
     * @param className psr-4 class name
     * @param construct [boolean] default true. will instantiate on load.
     * @param success [function] callback function when class loads
     * @param failure [function] callback function when class fails to load
     * @param complete [function] callback function when class either loads or fails.
     * @desc gets previously instantiated object if already loaded. Fetches, registers and calls callback if not loaded.
     *
     */
    this.load = function(param){
        param = param || {};
        param.method = param.method || 'GET';
        param.url = param.url || false;
        param.load = param.load || function(){};
        param.error = param.error || function(){};
        param.abort = param.abort || function(){};
        param.target = param.target || false;

        var ajax = new XMLHttpRequest();
        ajax.target = param.target;
        ajax.param = param;
        ajax.addEventListener('load', function(){
            if(this.statusText == 'OK'){
                var callback = getFrom(this.param, 'load');
                if(!callback || !is_function(callback)) return false;
                callback.bind(this, this.responseText)();
            }else{
                var callback = getFrom(this.param, 'error');
                if(!callback || !is_function(callback)) return false;
                callback.bind(this, this.responseText)();
            }
        })
        ajax.addEventListener('abort', param.abort);

        ajax.open(param.method, param.url);

        if(param.data){
            ajax.send(param.data);
        }else{
           ajax.send();
        }
    };
}();;Silo.Cache = new function(){

    this.clear = function(key){

    };
    this.set = function(key, value){

    };

    this.get = function(key, _default){

    };

    this.event = function(event, element, callback){
        (function(that){
            if(!(match = event.match(/(click|mousedown|mouseup|dblclick)/))) return null;
            if(!is_element(element)) return null;
            if(!is_function(callback)) return null;
            if(that.event.get(element, event).length) return true;     //check to see if identical event has already been registered
            that.event[match[1]].push({
                event: event,
                element: element,
                callback: callback
            });
        })(this, event, element, callback);
    };
    this.event.get = function(element, event){

        if(is_element(element)){
            if(!Silo.Cache.event.hasOwnProperty(event)) return false;
            return (function(element, event){
                var events = [];
                for(var a = 0, e; e = Silo.Cache.event[event][a]; a++){
                    if(e.element !== element) continue;
                    events.push(e);
                }
                return events;
            })(element, event)
        }
    }
    this.event.click = [];
    this.event.mouseup = [];
    this.event.mousedown = [];
    this.event.dblclick = [];

	/**
	 *  possible usage
	 *  param[string] - returns element with specified silo-id or false
	 *  param1[array] - an array with array.element object
	 *  param1[element], param2[array] - the silo-each element, array collection 
	 */
    this.each = function(param1, param2){
    	if(is_array(param1) && is_element(param1.element)){
    		this.each.items.push({element:param1.element, collection:param1});
    	}else if(is_element(param1) && is_array(param2)){
    		this.each.items.push({element:param1, collection:param2});
    	}else if(is_string(param1)){
    		for(key in this.each.items){
    			var i = this.each.items[key];
    			if(i.element.getAttribute('silo-id') == param1) return i;
    		}
    		return false;
    	}
    };

    this.each.items = [];
    
}();;Silo.Router = new function(){
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
            for(var a= 0, route; route=that.routes[a]; a++){
            	if(route.validate && route.hash.match(/\:\w+/)){
            		
            	}
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


;Silo.View = function(param){
    return new (function(param){
        this.url = (is_string(param)) ? param :  param.url || false;
        this.load = param.load || false;
        this.error =  param.error || false;
        this.html = false;
        this.element = param.element || false;

        this.target = function(v){
            if(v === undefined){return this.target.dom;}
            if(!is_object(v)) return false;
            var dom = getFrom(v,'element');
            if(!is_element(getFrom(v, 'element'))) return false;
            this.target.dom = v;
        };

        this.target.dom = (is_element(getFrom(param,'target.element'))) ? param.target : false;

        this.render = function(variables) {
            var url = (window.location.search.match(/debug/)) ? this.url + '?' + Date.now() : this.url;
            Silo.Loader.load({
                url: url,
                target: {view:this,variables:variables},
                load: function(html){
                    if(is_element(this.target.view.element)){
                        this.target.view.element.innerHTML = html;
                        Silo.View.renderElement(this.target.view.element);
                    }
                }
            })
        }
    })(param);
}



Silo.View.load = function(element, parent){
    (function(element, parent){
        dom = $dom(element);
        var nodeName = dom.element.nodeName.toLowerCase();
        var src = dom.attr('src');
        switch(nodeName){
            case 'silo:view':
                var scope = Silo.scope(element);
                if((silo = $dom(Silo.getSilo(element)))){
                    src = (silo.attr('src')) ? silo.attr('src') + '/views/' + src : './views/'+src;
                }
                break;
            case 'silo:include': break;
        }
        Silo.Loader.load({
            url: src,
            target: {dom:dom,parent:parent},
            load: function(html) {
                var div = document.createElement('div');
                div.innerHTML = html;
                var el = this.target.dom.replaceWith(div);
                Silo.View.renderElement(div, 'view');
            },
            error: function(){
                console.log('Silo Error: Failed to load view ' + this.responseURL);
            }
        })
    })(element, parent);
};

Silo.View.renderElement = function(element, reload){
    if(!is_element(element)) return false;
    var scope = Silo.scope(element);
    var directiveTags = $dom(element).find('silo\\:controller,silo\\:include,silo\\:view, silo\\:if, [silo-each]:not([silo-each-root])');
    if(directiveTags.length){
        for(var b= 0, dt; dt=directiveTags[b]; b++){
            //dt.silo = siloTag;
            switch(dt.element.nodeName.toLowerCase()){
                case 'silo:include': case 'silo:view': 
                	this.load(dt.element, element); 
                	break;
                case 'silo:controller':
                    /**
                     * render this element again when the controller loads so that
                     * the dependency is loaded for the rest of the script following
                     */
                    Silo.loadController(dt);
                    return false;
                case 'silo:if':
                    var expressionValue = this.renderIf(dt.element);
                    if(expressionValue){
                        dt.replaceWith(dt.element.innerHTML);
                    }else{
                        dt.remove();
                    }
                    return this.renderElement(element);

                case 'silo:each':
                    var el = this.renderEach(dt.element);
                    if(el === null){
                        $dom(element).remove();
                        continue;
                    }
                    return this.renderElement(element);
                default:
                    if(dt.attr('silo-each')){
                        Silo.Bind.each(dt.element, Silo.scope(dt.element));
                        return this.renderElement(element);
                    }else{
                    	return this.renderElement(element)
                    }
            }
        }
    }else{
        html = this.renderExpressions(element.innerHTML, scope);
        element.innerHTML = html;
        // Render silo-bind attributes
    	if((binds = $dom(element).find('[silo-bind]'))){
    		for(var a=0, i; i=binds[a]; a++){
    			Silo.Bind.element(i.element, Silo.scope(i.element))
    		}
    	}
        this.addSiloEvents(element);
    }

}
/**
 *
 * @param element - The dom element to set the
 */
Silo.View.addSiloEvents = function(element, dev){
    (function(element, dev){
        var dom = $dom(element);
        var elements = $dom('[silo-click],[silo-dblclick],[silo-mouseup],[silo-mousedown],[silo-change]');
        var _events = ['click','dblclick','keydown','keyup', 'mousedown','mouseup','change','drag','dragstart',
                       'dragend','dragenter','dragexit','dragleave','dragover'];
        var query = '[silo-' + _events.join('], [silo-') + ']';
        var elements = $dom(query);
        
        for(var a= 0, e; e=elements[a]; a++){
        	if(e.attr('silo-each')) continue;
        	for(var b=0, event; event=_events[b]; b++){
        		if(!(callbackName = e.attr('silo-' + event))) continue;
        		if(callbackName.match(/\./)) {
                    var parentName = callbackName.trim().replace(/\.[a-z0-9_]+$/i, '');
                    if(!(parent = Silo.scope(parentName))) continue;
                    if(!(callback = Silo.scope(callbackName))) continue;
                    if(!is_function(callback)) continue;
                    e.element.addEventListener(event, callback.bind(parent));
                    Silo.Cache.event(event, e.element, callback.bind(parent));
                }else{
                    var scope = Silo.scope(e.element);
                    if(!scope.length) continue;
                    for(var c= 0, s; s=scope[c]; c++){
                    	var ctrl = (s===window) ? s : Silo.scope($dom(s).attr('src'));
                    	if(!is_function(getFrom(ctrl, callbackName))) continue;
                        e.element.addEventListener(event, ctrl[callbackName].bind(ctrl));
                        Silo.Cache.event(event, e.element, ctrl[callbackName].bind(ctrl));
                        break;
                    }
                }
        	}
        }
    })(element, dev);
}

Silo.View.renderIf = function(element){
    var condition = null;
    var scope = Silo.scope(element,1);

    var attrs = element.attributes;

    if(!attrs.length) return null;

    if(attrs.length === 1){
        var subject = attrs[0].nodeName;
        var value = attrs[0].nodeValue;
        if(value === ''){
            /**
             * this will render experssions such as:
             * <silo:if subject></silo:if>
             */
            scope.each(function(){
            	if(this.className){
            		var _cond = getFrom(Silo.scope, this.className, 'SILO_FALSE');
                    if(_cond !== 'SILO_FALSE'){
                    	condition = _cond;
                    	return false;
                    }
            	}else{
            		var _cond = getFrom(this, subject, 'SILO_FALSE');
            		if(_cond !== 'SILO_FALSE'){
            			condition = _cond;
            			return false;
            		}
            	}
            });
        }else{
            /**
             * this will render expressions such as:
             * <silo:if subject="test subject">
             */
            scope.each(function(){
            	if(this.className){
            		 var val = getFrom(Silo.scope, this.className+'.'+subject, 'SILO_FALSE');
            		 if(val != 'SILO_FALSE' && val ==value){
            			 condition = true;
            			 return false;
            		 }
            	}else{
            		var val = getFrom(this, subject, 'SILO_FALSE');
            		if(val !== 'SILO_FALSE'){
            			condition = (val == value) ? true : false;
            			return false;
            		}
            	}
               
                //console.log(ctrl)
                //console.log(val+ ' : ' + value);
            });
        }
        return condition;
    }
};

Silo.View.renderEach = function(element){
    return (function(element){
        var scope = Silo.scope(element);
        var dom = $dom(element);
        var atts = element.attributes;
        var alias = (dom.attr('as')) ? dom.attr('as') : 'item';
        var markup = dom.html();
        var key = (dom.attr('key')) ? dom.attr('key') : 'key';
        if(!atts.length) return null;
        var collection = false;

        scope.each(function(){
            var cltn =  getFrom(Silo.scope, this.className + '.' + atts[0].nodeName);
            if(cltn === null) return true;        // return true to continue Silo.scope.each loop
            collection = cltn;
            return false;                          // return false to stop Wilo.scope.each loop
        });

        if(!is_array(collection)) return null;

        var html = '';

        for(k in collection){
            var _scope = scope.slice(0);
            _scope.each = scope.each;
            var arrayElement = [];
            arrayElement[key] = k
            arrayElement[alias] = collection[k];
            _scope.unshift(arrayElement);
            var _html = Silo.View.renderExpressions(markup, _scope);
            if(_html === null){
                console.log('Silo Expression Error around: ' + markup);
                continue;
            }
            html += _html;
            //html+= this.renderExpressions(markup, _scope);
        }

        return dom.replaceWith(html);
    })(element);

}

Silo.View.getFromScope = function (variable, scope){
    return (function(){
        var value = null;
        scope.each(function(){
            if(is_element(this)){
                var ctrl = getFrom(Silo.scope, this.className);
                if(!ctrl) return true;              // continue scope each loop
                value = getFrom(ctrl, variable);
                if(value === null) return true;     // continue scope each loop
                if(is_function(value)){
                    value = value.bind(ctrl);       // set this constant of function to controller object
                }
                return false;                       // break scope each loop
            }else{
                value = getFrom(this, variable);
                if(value === null) return true;     // continue scope each loop
                if(is_function(value)){
                    value = value.bind(this);       // set this constant of function to scope object
                }
                return false;                       // break scope each loop
            }
        });
        return value;
    })(variable, scope);
};

Silo.View.expressionValue = function(expression, scope){
    expression = expression.replace(/^{{/, '').replace(/}}$/, '');
    var segments = expression.split(' ');
    return (function(segments, scope){
        var currentValue = null;
        var operator = false;

        for(var a= 0, segment; segment = segments[a]; a++){
            switch(segment){
                case '||':
                    if(currentValue) return currentValue;
                    operator = '||';
                    break;

                default:

                    if(segment.match(/^('|")/ || segment.match(/('|")$/))){
                        /**
                         * store string segment enclosed by single or double quotes
                         */
                        currentValue = segment.replace(/^('|")/,'').replace(/('|")$/, '');

                    }else if((match = segment.match(/([a-z][a-z0-9_\-\.]+)\(\)$/i))){
                        /**
                         * store function value
                         */
                        var func = Silo.View.getFromScope(match[1], scope);
                        if(is_function(func)){
                            currentValue = func();
                        }
                    }else{
                        /**
                         * store scope value of variable
                         */
                        currentValue = Silo.View.getFromScope(segment, scope);
                        if(typeof(currentValue) == 'object' || is_function(currentValue)){
                            currentValue = false;
                        }
                    }

                    switch(operator){
                        case '||':
                            if(currentValue) return currentValue;
                            break;
                    }
                    operator = false;
                    //console.log(segment+' = ' +currentValue);
            }
        }
        return currentValue;
    })(segments, scope);
}
/**
 *
 * @param html[string] the string to be rendered
 * @param options[object]
 * 			raw - default false: when false will not render placeholder. eg {{title | raw}}
 * @desc will parse placeholder {{variables}} and {{expressions || functions()||
 * 
 */
Silo.View.renderExpressions = function(html, scope, options){
    return (function(html,scope, options){
        var pattern = /({)?{{([\w\s;:.,'"!|@#$%^&*()_+\-\[\]]+)}}(})?/g;
        var match = html.match(pattern);
        if(!match) return html;
        for(var a= 0, expression; expression = match[a]; a++){
        	if(expression.match(/^{{{/) && expression.match(/}}}$/)){
        		html = html.replace(expression, expression.substr(1, expression.length -2))
        		continue;
        	}
            var expressionValue = Silo.View.expressionValue(expression, scope);
            html = html.replace(expression, expressionValue);
        }
        return html;
    })(html, scope, options);
}

;Silo.Bind = new function(){
    this.listeners = [];
    
    this.element = function(element, scope) {
		var i = $dom(element);
		var str = i.attr('silo-bind');
		if (Silo.View.getFromScope(str, scope) === null){
			i.element.removeAttribute('silo-bind');
			return false;
		}
		var obj = Silo.getParentFromScope(str, scope);
		switch ((nodeName = i.element.nodeName.toLowerCase())) {
			case 'select': case 'input': case 'textarea':
				element.addEventListener('change', function(obj, str) {
					var property = str.split('.');
					property = property[property.length - 1];
					obj[property] = this.value;
				}.bind(i.element, obj, i.attr('silo-bind')));
			break;
		}
		i.element.removeAttribute('silo-bind');
	}
    /**
	 * @desc Silo.Bind.each(element) This function sill attach a render function
	 *       to the specified dom element only when the element has the
	 *       silo-persist attribute
	 * @param element
	 * @param collection
	 * @returns {boolean}
	 */
    this.each = function(element, collection){
        if(!is_element(element)) return false;
        //if(!is_element(element) || !is_array(collection)) return false;
        // persist each elements are cached in Silo.Bind.each.items
        // if the each element has not already been registered....
        if(this.each.items.indexOf(element) === -1){
            // need to qualify the silo each element
            element.index = (this.each.items.length) ? this.each.items.length -1 : 0;
            // make sure it is not rendered again in view.renderElement
            element.setAttribute('silo-each-root', element.index);
            // hide the root each element from users
            //element.style.display = 'none';
            var expression = element.getAttribute('silo-each'),
                pattern = /([a-z0-9\_\.]+) as ([a-z0-9\_]+)/i,
                match = expression.trim().match(pattern),
                scope = Silo.scope(element),
                collection = false;

            scope.each(function(){
                if(is_element(this)){
                    collection = getFrom(this.controller, match[1]);
                }else{
                    collection = getFrom(this, match[1]);
                }

                if(collection) return false;
            });
            
            if(!collection || !is_array(collection)) return false;
            
            element.collection = collection;
            element.initialRender = null;
            collection.element = element;
            collection.push = (function(arr, scope){
                return function(val,scope){
                    Array.prototype.push.bind(arr,val)();
                    this.element.render();
                }
            })(collection, this)
            
                // hide source each element
            element.render = function(){
                var element = document.querySelector('[silo-each-root="'+this.index+'"]'),
                	scope = Silo.scope(element),
                    children = document.querySelectorAll('[silo-each-index="'+this.index+'"]'),
                    callback = $dom(element).attr('silo-callback'),
                    markup = this.innerHTML,
                    html = '',
                    collection;
                this.initialRender = (this.initialRender === null) ? true : (this.initialRender === true) ? false : false;
                // remove previous rendered children
                if(children.length){
                    for(var a= 0, i; i=children[a]; a++){
                    	i.parentNode.removeChild(i);
                    }
                }

                for(var a= 0,model; model=this.collection[a]; a++){
                    var el = document.createElement(this.nodeName);
                    el.setAttribute('silo-each-index', this.index)
                    var _scope = {};
                    _scope[match[2]] = model;
                    _scope[this.getAttribute('silo-index') || 'index'] = a; // set iteration index
                    scope.unshift(_scope);
                    el.innerHTML = Silo.View.renderExpressions(markup, scope, {raw:true});

                    for(var b= 0, attr; attr=element.attributes[b]; b++){
                    	if(attr.nodeName == 'silo-each') continue;
                    	if(attr.nodeName == 'silo-each-root') continue;
                    	if(attr.nodeName == 'silo-id') continue;
                    	//if(attr.nodeName == 'silo-each-root') continue;
                        var attrVal = Silo.View.renderExpressions(attr.nodeValue, scope, {raw:true});
                        el.setAttribute(attr.nodeName, attrVal)
                    }
                    scope.splice(0,1);
                    var e = document.querySelector('[silo-each-root="'+this.index+'"]');
                    e.parentNode.insertBefore(el, e);
                }
                if(this.initialRender === false){
                	Silo.View.addSiloEvents(this)
                }
                
                var binds = $dom('[silo-each-index="'+this.index+'"] [silo-bind]');
                for(var a=0, i; i = binds[a]; a++){
                	Silo.Bind.element(i.element, scope)
                }
               
                if(callback){
                	for(var a=0, _scope; _scope=scope[a]; a++){
                		if(is_element(_scope)){
                			var className = $dom(_scope).attr('src');
                			if(!(ctrl = getFrom(Silo.scope, className))) continue;
                			if(!(_callback = getFrom(ctrl, callback))) continue;
                			if(!is_function(_callback)) continue;
                			_callback.bind(ctrl)(this);
                			break;
                		}else{
                			if(!(_callback = getFrom(_scope, callback))) continue;
                			if(!is_function(_callback)) continue;
                			_callback.bind(_scope)(this);
                			break;
                		}
                	}
                }
            }
            // Cache silo-each eleemnt
            Silo.Cache.each(element, collection);
            element.render();

        }else{
            console.log('lets do it')
        }

    };

    this.each.items = [];

    this.dispatch = function(siloEvent){
    	
    }

}();