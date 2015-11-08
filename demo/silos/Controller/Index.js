(function(){
    this.title = 'Silojs Javascript Framework';
    this.route = false;

    this.construct = function(){
        Silo.Router
            .route({hash: 'docs/order-of-operation', callback: this.orderOfOperation, controller: 'Controller.Index'})
            .route({ hash: 'docs/getting-started', callback: this.gettingStarted, controller: this})
            .route({hash: 'docs/reference/view',  callback: this.viewReference, controller: this})
            .route({hash:'docs/reference/controller', callback: this.ctrlReference, controller:this})
            .route({hash:'docs/reference/router', callback: this.routerReference, controller:this})
            .route({hash:'docs/reference/events', callback:this.eventsReference, controller:this});
        this.view = {
            orderOfOperation: new Silo.View(this.path + '/views/order-of-operation.html'),
            gettingStarted: new Silo.View(this.path + '/views/docs/getting-started.html'),
            viewReference: new Silo.View(this.path + '/views/docs/views.html'),
            ctrlReference: new Silo.View(this.path + '/views/docs/controller.html'),
            routerReference: new Silo.View(this.path + '/views/docs/router.html'),
            eventsReference: new Silo.View(this.path + '/views/docs/events.html'),
        };
    };

    this.eventsReference = function(){
        this.title = 'Silo Events';
        this.view.eventsReference.element = $dom('#block-1',1)[0];
        this.view.eventsReference.render(this);

    };

    this.ctrlReference = function(){
        this.title = 'Silo Controller';
        this.view.ctrlReference.element = $dom('#block-1',1)[0];
        this.view.ctrlReference.render(this);

    };

    this.routerReference = function(){
        this.title = 'Silo Router';
        this.view.routerReference.element = $dom('#block-1',1)[0];
        this.view.routerReference.render(this);

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