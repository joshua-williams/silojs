Silo.Bind = new function(){
    /**
     * @desc Silo.Bind.each(element)
     * This function sill attach a render function to the specified dom element
     * only when the element has the silo-persist attribute
     * @param element
     * @param collection
     * @returns {boolean}
     */
    this.each = function(element, collection){
        if(!is_element(element) || !is_array(collection)) return false;
        // persist each elements are cached in Silo.Bind.each.items
        // if the each element has not already been registered....
        if(this.each.items.indexOf(element) === -1){
            console.log('registering persist each...');
            // need to qualify the silo each element
            element.index = (this.each.items.length) ? this.each.items.length -1 : 0;

            element.render = function(){
                var scope = Silo.scope(element),
                    parent = element.parentNode,
                    expression = this.getAttribute('silo-each'),
                    pattern = /([a-z0-9\_]+) as ([a-z0-9\_]+)/i,
                    match = expression.trim().match(pattern),
                    markup = this.innerHTML,
                    html = '',
                    collection;
                //console.log(expression); return;
                scope.each(function(){
                    collection = getFrom(this, match[1]);
                    if(collection) return false;
                });
                if(!collection || !is_array(collection)) return false;

                for(var a= 0,model; model=collection[a]; a++){
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

                    parent.insertBefore(el, element);
                    scope.splice(0,1);
                }
            }
            this.each.items.push(element);
            element.render();

        }else{
            console.log('lets do it')
        }

    };

    this.each.items = [];


}();