Silo.Bind = new function(){
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
                pattern = /([a-z0-9\_]+) as ([a-z0-9\_]+)/i,
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
                    el.innerHTML = Silo.View.renderExpressions(markup, scope);

                    for(var b= 0, attr; attr=element.attributes[b]; b++){
                        if(attr.nodeName.match(/^silo/)) continue;
                        el.setAttribute(attr.nodeName, Silo.View.renderExpressions(attr.nodeValue, scope))
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
            
            //this.each.items.push(element);
            element.render();

        }else{
            console.log('lets do it')
        }

    };

    this.each.items = [];

    this.dispatch = function(siloEvent){
    	
    }

}();