(function(){
    this.title = 'Silojs Javascript Framework';
    this.route = false;

    this.construct = function(){
        Silo.Router
            .route({hash: 'docs/order-of-operation', callback: this.orderOfOperation, controller: 'Controller.Index'})
            .route({ hash: 'docs/getting-started', callback: this.gettingStarted, controller: this})
            .route({hash: 'docs/reference/view',  callback: this.viewReference, controller: this});
        this.view = {
            orderOfOperation: new Silo.View(this.path + '/views/order-of-operation.html'),
            gettingStarted: new Silo.View(this.path + '/views/docs/getting-started.html'),
            viewReference: new Silo.View(this.path + '/views/docs/views.html'),
        };
    };

    this.orderOfOperation = function(){
        this.title = 'Order of Operation';
        this.view.orderOfOperation.element = $dom('#block-1',1)[0];
        this.view.orderOfOperation.render(this);

    };
    this.gettingStarted = function(){
        this.title = 'Getting Started with Silojs'
        this.view.gettingStarted.element = ($dom('#block-1')[0].element);
        this.view.gettingStarted.render(this);
    }

    this.viewReference = function(){
        this.title = 'Silojs View Reference';
        this.view.viewReference.element = $dom('#block-1',1)[0];
        this.view.viewReference.render(this);
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