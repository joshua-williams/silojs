(function(){

    this.construct = function(){
        this.loadViews();
        Silo.Router.route({
            hash: 'docs/order-of-operation',
            callback: this.orderOfOperation,
            controller: 'Controller.Index'
        });
    };

    this.orderOfOperation = function(){

        var view = new Silo.View(this.path + '/views/order-of-operation.html');

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