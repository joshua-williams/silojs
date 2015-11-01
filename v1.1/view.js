Silo.View = function(param){
    return new (function(param){
        this.url = (is_string(param)) ? param :  param.url || false;
        this.load = param.load || false;
        this.error =  param.error || false;
        this.html = false;

        this.target = function(v){
            if(v === undefined){return this.target.dom;}
            if(!is_object(v)) return false;
            var dom = getFrom(v,'element');
            if(!is_element(getFrom(v, 'element'))) return false;
            this.target.dom = v;
        };

        this.target.dom = (is_element(getFrom(param,'target.element'))) ? param.target : false;

        this.render = function(variables) {
            Silo.Loader.load({
                url: (window.location.search.match(/debug/)) ? this.url + '?' + Date.now() : this.url,
                target: {view:this,variables:variables},
                load: function(){
                    if(this.statusText === "OK"){
                        var el = this.target.view.target();
                        if(el){
                            el.html(this.responseText)
                        }
                    }else{

                    }
                }
            })
        }
    })(param);
}


Silo.View.renderEachBak = function(tag, html, vars){
    return (function(tag,html,vars){
        var subject = tag.open.seg(0).key;
        var collection = getFrom(vars, subject);

        if(!is_array(collection) && !is_object(collection)){
            console.log("Silo Error: Invalid each source in " + subject);
            return this.htmlDeleteTag(tag, html);
        }

        var alias = tag.open.seg(2).key;
        var key = tag.open.attr('key');
        var tags = this.matchTags(html);
        var content = html.substring(tag.open.index + tag.open.html.length, tag.close.index);
        var markup = (function(collection, alias, vars, html, tags, view){
            var markup = '';

            vars.iteration = 0;
            for(key in collection){
                var _markup = html;
                vars[alias||'item'] = collection[key]
                var pattern = /{{([\w\s;:.,'"!|@#$%^&*()_+\-\[\]]+)}}/g;
                if((match = _markup.match(pattern))){
                    for(var a=0, placeholder; placeholder=match[a]; a++){
                        _markup = _markup.replace(placeholder, view.placeholderValue(placeholder, vars));
                    }
                }
                markup+=_markup;
                vars.iteration++;
            }
            return markup
        })(collection, alias, vars, content, tags, this);
        html = html.substring(0, tag.open.index) + markup + html.substring(tag.close.index + tag.close.html.length);
        return html;

    })(tag,html,vars);

};
/**
 * @desc will render placeholders {{varName}} and return rendered value
 * 	it can work like this too {{varName || methodName() || "alt string value if all else fails"}}
 * 	if will try each segment until one returns true or false if non returns true
 *  notice methods can be denoted with triling ().
 *  String value must be enclosed in single or double quote
 */
Silo.View.placeholderValue = function(placeholder, vars, scope){
    var value = (function(placeholder, vars, scope){
        var expression = placeholder.replace(/^{{/,'').replace(/}}$/,'');
        var match = expression.match(/^([\w.]+)(\(\))?/);
        var subject = match[1]
        var isFunction = match[2];
        var value = null;
        if(isFunction){
            var func = getFrom(vars, subject);
            value = (is_function(func)) ? func() : null;
        }else{
            value = getFrom(vars, subject);
        }

        if(value) return value;

        var pattern = /\|\|\s([\w\s.'"!@#$%^&*\[\]()_+]+)/g;
        while((match = pattern.exec(expression))){
            var subject = match[1].trim();
            if(subject.match(/\(\)$/)){
                var func = getFrom(vars,subject.replace('()',''));
                value = (is_function(func)) ? func() : null;
            }else if((m = match[1].trim().match(/^'|"/))){
                value = subject.replace(/^'|"/,'').replace(/'|"$/,'');
            }else{
                value = getFrom(vars, subject);
            }
            if(value) return value;
        }
        return value;
        //var exp = placeholder.replace('{{','').replace('}}','');
        //return exp;
    })(placeholder, vars, scope);
    return value;
};

Silo.View.replacePlaceholdersBak = function(html, vars){
    var pattern = /{{([\w\s;:.,'"!|@#$%^&*()_+\-\[\]]+)}}/g;
    if((match = html.match(pattern))){
        for(var a=0, placeholder; placeholder=match[a]; a++){
            var value = this.placeholderValue(placeholder, vars);
            value = (value) ? value : '';
            html = html.replace(placeholder, value);
        }
    }
    return html;
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
                    src = (silo.attr('src')) ? silo.attr('src') + '/views/' + src : src;
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
                this.target.replaceWith(div);
                Silo.View.renderElement(div, 'view');
            },
            error: function(){
                console.log('Silo Error: Failed to load view ' + this.responseURL);
            }
        })
    })(element);
};

Silo.View.renderElement = function(element, reload){
    if(reload){
        //console.log('reloading ' + reload + ' element')
    }
    if(!is_element(element)) return false;
    var scope = Silo.scope(element);
    var directiveTags = $dom(element).find('silo\\:controller,silo\\:include,silo\\:view, silo\\:if, silo\\:each');
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
                if(this.renderIf(dt.element)){
                    dt.replaceWith(dt.element.innerHTML);
                }else{
                    dt.remove();
                }
                return this.renderElement(element);

            case 'silo:each':
                this.renderEach(dt.element);
                return false;
                break;
        }
    }
}

Silo.View.renderIf = function(element){
    var condition = false;
    var scope = Silo.scope(element,1);

    var attrs = element.attributes;

    if(!attrs.length) return false;

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
    if(value === ''){


    }
};

Silo.View.renderEach = function(element){
    var scope = Silo.scope(element);
    var dom = $dom(element);
    var atts = element.attributes;
    var alias = (dom.attr('as')) ? dom.attr('as') : 'item';
    var markup = dom.html();
    var key = (dom.attr('key')) ? dom.attr('key') : 'key';
    if(!atts.length) return false;
    var collection = false;
    scope.each(function(){
        var cltn =  getFrom(Silo.scope, this.className + '.' + atts[0].nodeName);
        if(cltn === null) return true;        // return true to continue Silo.scope.each loop
        collection = cltn;
        return false;                          // return false to stop Wilo.scope.each loop
    });

    if(!is_array(collection)) return false;
    var html = '';

    for(k in collection){

        var _scope = scope.slice(0);
        _scope.each = scope.each;
        var arrayElement = [];
        arrayElement[key] = k
        arrayElement[alias] = collection[k];
        _scope.unshift(arrayElement);
        var _html = this.renderExpressions(markup, _scope);
        if(_html === null){
            console.log('Silo Expression Error around: ' + markup);
            continue;
        }
        html += _html;
        //html+= this.renderExpressions(markup, _scope);
    }
    dom.replaceWith(html)
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
        if(!match) return null;
        for(var a= 0, expression; expression = match[a]; a++){
            var expressionValue = Silo.View.expressionValue(expression, scope);
            html = html.replace(expression, expressionValue);
        }
        return html;
    })(html, scope);
}

/**
 * @desc will render placeholders {{varName}} and return rendered value
 * 	it can work like this too {{varName || methodName() || "alt string value if all else fails"}}
 * 	if will try each segment until one returns true or false if non returns true
 *  notice methods can be denoted with triling ().
 *  String value must be enclosed in single or double quote
 */
Silo.View.placeholderValue = function(placeholder, vars, scope){
    var value = (function(placeholder, vars, scope){
        var expression = placeholder.replace(/^{{/,'').replace(/}}$/,'');
        var match = expression.match(/^([\w.]+)(\(\))?/);
        var subject = match[1]
        var isFunction = match[2];
        var value = null;
        if(isFunction){
            var func = getFrom(vars, subject);
            value = (is_function(func)) ? func() : null;
        }else{
            value = getFrom(vars, subject);
        }

        if(value) return value;

        var pattern = /\|\|\s([\w\s.'"!@#$%^&*\[\]()_+]+)/g;
        while((match = pattern.exec(expression))){
            var subject = match[1].trim();
            if(subject.match(/\(\)$/)){
                var func = getFrom(vars,subject.replace('()',''));
                value = (is_function(func)) ? func() : null;
            }else if((m = match[1].trim().match(/^'|"/))){
                value = subject.replace(/^'|"/,'').replace(/'|"$/,'');
            }else{
                value = getFrom(vars, subject);
            }
            if(value) return value;
        }
        return value;
        //var exp = placeholder.replace('{{','').replace('}}','');
        //return exp;
    })(placeholder, vars, scope);
    return value;
};
