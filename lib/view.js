Silo.View = function(param){
    return new (function(param){
        this.url = (is_string(param)) ? param :  param.url || false;
        this.load = param.load || false;
        this.error =  param.error || false;
        this.html = false;
        this.element = false;

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



Silo.View.load = function(element){
    (function(element){
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
            target: dom,
            load: function(html) {
                var div = document.createElement('div');
                div.innerHTML = html;
                var el = this.target.replaceWith(div);
                Silo.View.renderElement(div, 'view');
            },
            error: function(){
                console.log('Silo Error: Failed to load view ' + this.responseURL);
            }
        })
    })(element);
};

Silo.View.renderElement = function(element, reload){
    if(!is_element(element)) return false;
    var scope = Silo.scope(element);
    var directiveTags = $dom(element).find('silo\\:controller,silo\\:include,silo\\:view, silo\\:if, [silo-each]:not([silo-each-root])');
    if(directiveTags.length){
        for(var b= 0, dt; dt=directiveTags[b]; b++){
            //dt.silo = siloTag;
            switch(dt.element.nodeName.toLowerCase()){
                case 'silo:include': case 'silo:view': this.load(dt.element); break;
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
                    }
            }
        }
    }else{
        html = this.renderExpressions(element.innerHTML, scope);
        element.innerHTML = html;
        this.addSiloEvents(element);
    }

}
/**
 *
 * @param element - The dom element to set the
 */
Silo.View.addSiloEvents = function(element){
    (function(element){
        var dom = $dom(element);
        var elements = $dom('[silo-click],[silo-dblclick],[silo-mouseup],[silo-mousedown]');

        for(var a= 0, e; e=elements[a]; a++){

            if((callbackName = e.attr('silo-click'))){
                var event = 'click';
            }else if((callbackName = e.attr('silo-mousedown'))){
                var event = 'mousedown';
            }else if((callbackName = e.attr('silo-mouseup'))){
                var event = 'mouseup';
            }else if((callbackName = e.attr('silo-dblclick'))){
                var event = 'dblclick';
            }else{ continue;}

            if(callbackName.match(/\./)) {
                var parentName = callbackName.trim().replace(/\.[a-z0-9_]+$/i, '');
                if(!(parent = Silo.scope(parentName))) continue;
                if(!(callback = Silo.scope(callbackName))) continue;
                if(!is_function(callback)) continue;
                e.element.addEventListener('click', callback.bind(parent));
                Silo.Cache.event('click', e.element, callback.bind(parent));
            }else{
                var scope = Silo.scope(e.element);
                if(!scope.length) continue;
                for(var b= 0, s; s=scope[b]; b++){
                    s = $dom(s);
                    var ctrl = Silo.scope(s.attr('src'));
                    if(!is_function(ctrl[callbackName])) continue;
                    e.element.addEventListener(event, ctrl[callbackName].bind(ctrl));
                    Silo.Cache.event(event, e.element, ctrl[callbackName].bind(ctrl));
                    break;
                }
            }
        }
    })(element);

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
                condition = getFrom(Silo.scope, this.className);
            });
        }else{
            /**
             * this will render expressions such as:
             * <silo:if subject="test subject">
             */
            scope.each(function(){
                var val = getFrom(Silo.scope, this.className+'.'+subject);
                if(val == value){
                    condition = true;
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
        console.log(collection);
        console.log(element)

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
 * @desc will parse placeholder {{variables}} and {{expressions || functions()||
 */
Silo.View.renderExpressions = function(html, scope){
    return (function(html,scope){
        var pattern = /{{([\w\s;:.,'"!|@#$%^&*()_+\-\[\]]+)}}/g;
        var match = html.match(pattern);
        if(!match) return html;
        for(var a= 0, expression; expression = match[a]; a++){
            var expressionValue = Silo.View.expressionValue(expression, scope);
            html = html.replace(expression, expressionValue);
        }
        return html;
    })(html, scope);
}

