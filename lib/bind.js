Silo.Bind = new function(){
    this.listeners = [];
    /**
     * @desc Silo.Bind.each(element)
     * This function sill attach a render function to the specified dom element
     * only when the element has the silo-persist attribute
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
            collection.element = element;
            collection.push = (function(arr, scope){
                return function(val,scope){
                    Array.prototype.push.bind(arr,val)();
                    this.element.render();
                }
            })(collection, this)
            
                // hide source each element
            element.render = function(){
                var element = document.querySelector('[silo-each-root="' + this.index + '"]'),
                	scope = Silo.scope(element),
                    children = $dom('[silo-each-index="'+this.index+'"]'),
                    callback = $dom(this).attr('silo-callback'),
                    markup = this.innerHTML,
                    html = '',
                    collection;
                // remove previous rendered children
                if(children.length){
                    for(var a= 0, i; i=children[a]; a++){
                        i.remove();
                    }
                }
                for(var a= 0,model; model=this.collection[a]; a++){
                    var el = document.createElement(this.nodeName);
                    el.setAttribute('silo-each-index', element.index)
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
                			var _callback = getFrom(_scope, callback);
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