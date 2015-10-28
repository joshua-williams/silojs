(function(){

    this.construct = function(){
        console.log('Index controller loaded');
        this.loadViews();
    };

    this.loadViews = function(){
        var view = new Silo.View(this.path + '/views/header.html');
        view.target(this.dom.find('header')[0]);
        view.render(this);

        var footer = new Silo.View(this.path+'/views/footer.html');
        footer.target(this.dom.find('footer')[0]);
        footer.render(this);
    }
})