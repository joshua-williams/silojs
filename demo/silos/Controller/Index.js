(function(){

    this.construct = function(){
        this.loadViews();
        Silo.Router.route({
            hash: 'docs/order-of-operation',
            callback: this.orderOfOperation,
            controller: 'Controller.Index'
        }).route({
            hash: 'docs/getting-started',
            callback: this.gettingStarted,
            controller: this
        });
        this.view = {
            orderOfOperation: new Silo.View(this.path + '/views/order-of-operation.html'),
            gettingStarted: new Silo.View(this.path + '/views/docs/getting-started.html')

        };
    };

    this.orderOfOperation = function(){
        this.view.orderOfOperation.target($dom('#block-1')[0]);
        this.view.orderOfOperation.render(this);

    };
    this.gettingStarted = function(){
        this.view.gettingStarted.target($dom('#block-1')[0]);
        this.view.gettingStarted.render(this);
    }

    this.loadViews = function(){
        return false;
        var view = new Silo.View(this.path + '/views/header.html');
        view.target(this.dom.find('header')[0]);
        view.render(this);

        var footer = new Silo.View(this.path+'/views/footer.html');
        footer.target(this.dom.find('footer')[0]);
        footer.render(this);
    }
})