Silo.Cache = new function(){

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

}();