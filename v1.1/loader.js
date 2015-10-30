Silo.Loader = new function(){
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
}();