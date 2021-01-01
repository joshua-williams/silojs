const fs = require('fs');
const path = require('path');
const Route = require('./route');

class Router {
  constructor(options = {}) {
    this.rootDir = options.root || process.cwd();
    this.routes = {
      any: [],
      get: [],
      post: [],
      put: [],
      delete: [],
      connect: [],
      options: [],
      error: []
    }
    if (!this.rootDirExists()) {
      throw new Error('root path does not exist or does not have 755 permissions - ' + this.rootDir)
    }
  }

  rootDirExists() {
    try {
      return fs.existsSync(this.rootDir)
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  makeRoute(method, callback) {
    console.log(typeof callback)
    if (typeof callback != 'functionn') {
      throw new Error('route callback must be function');
    }
    if (!this.routes.hasOwnProperty(method)) {
      throw new Error('invalid http method');
    }
    let options = {method, callback};
    let route = new Route(options);
    this.routes[method].push(route)
  }

  get(uri, callback) {
    this.makeRoute('get', callback)
  }

  post(uri, callback) {
    this.makeRoute('post', callback)
  }

  put(uri, callback) {
    this.makeRoute('put', callback)
  }

  patch(uri, callback) {
    this.makeRoute('patch', callback)
  }

  delete(uri, callback) {
    this.makeRoute('delete', callback)
  }

  options(uri, callback) {
    this.makeRoute('options', callback)
  }

  any(uri, callback) {
    this.makeRoute('any', callback)
  }

  listen(req, res) {
    try {
      const {headers, url, method} = req;
      let ext = this.fileExtension(url);
      if (ext) {
        this.streamFile(url);
      } else {
        let indexPath = this.indexPath(url);
        if (!indexPath) {
          return this.dispatch('error')
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * @description Gets file extension from url string
   * @param url {string}
   * @returns {string|boolean} File extension
   */
  fileExtension(url="") {
    url = url.replace(/\?.*$/, '');
    let match = url.match(/\.(\w+)$/);
    if (!match) return false;
    return match[1];
  }

  /**
   * @description Gets the corresponding file path from url
   * @param url
   * @returns {string|boolean}
   */
  filePath(url='') {
    let filePath = path.join(this.rootDir, url);
    if (fs.existsSync(`${filePath}.html`)) {
      return `${filePath}.html`;
    } else if (fs.existsSync(`${filePath}.jsx`)) {
      return `${filePath}.jsx`
    }
    return false;
  }
  /**
   * @description Gets the index.(html|jsx) file path and checks if it exists
   * @param uri
   * @returns {string|boolean} Index file path if exists or false if not.
   */
  indexPath(uri) {
    let indexPath = path.join(this.rootDir, uri);
    if (fs.existsSync(path.join(indexPath, 'index.jsx'))) {
      return path.join(indexPath, 'index.jsx');
    } else if (fs.existsSync(path.join(indexPath, 'index.html'))) {
      return path.join(indexPath, 'index.html');
    } else {
      return false;
    }
  }

  dispatch(event) {
    if (this.routes.hasOwnProperty(event)) {
      for (route of this.routes[event]) {
        route.render()
      }
    }
  }

  streamFile(filePath) {

  }
}
module.exports = Router;