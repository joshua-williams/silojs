const Route = require('./route');

class Router  {
  constructor() {
    this.routes = {
      get: [],
      post: [],
      put: [],
      delete: [],
      connect: [],
      options: []
    }
  }

  buildRoute() {

  }

  get(uri, callback) {}
  post(uri, callback) {}
  put(uri, callback) {}
  patch(uri, callback) {}
  delete(uri, callback) {}
  options(uri, callback) {}
  any(uri, callback) {}
}
module.exports = Router