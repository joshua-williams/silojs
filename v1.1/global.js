var gettype = function(v){ if(is_array(v)){return 'array';} if(is_object(v)){return 'object';} if(is_numeric(v)){return 'number';} if(is_function(v)){return 'function';} return false;return (typeof(v)=='object') ? (is_array(v)?'array':'object') : typeof(v); }
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
                this.element.parentNode.insertBefore(v, this.element);
                this.element.parentNode.removeChild(this.element)
                return v;
            }
        };
        this.remove = function(){this.element.parentNode.removeChild(this.element);}
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
