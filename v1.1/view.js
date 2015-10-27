Silo.View = function(param){
    this.url = (is_string(param)) ? param :  param.url || false;
    this.load = param.load || false;
    this.error =  param.error || false;
    this.html = false;

    this.target = function(v){
        if(v === undefined){return this.target.dom;}
        console.log(v)
        if(!is_object(v)) return false;
        var dom = getFrom(v,'element');
        console.log(dom)
        if(!is_element(getFrom(v, 'element'))) return false;
        console.log('found it')
       this.target.dom = v;
    };
    this.target.dom = (is_element(getFrom(param,'target.element'))) ? param.target : false;
    this.render = function(variables) {
        console.log('rendering')
        Silo.Loader.load({
            url: this.url,
            target: {view:this,variables:variables},
            load: function(){
                if(this.statusText === "OK"){
                    var el = this.target.view.target();
                    console.log(el)
                    if(el){
                        el.html(this.responseText)
                    }
                }else{

                }
            }
        })
    }
}