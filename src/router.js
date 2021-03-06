const fs = require('fs');
const path = require('path');
const Route = require('./route');
const Request = require('./request');
const Response = require('./response');
const Cache = require('./cache');
const Parser = require('./parser');
const ContentType = require('./content-type');
const util = require('./util');

class Router {
  constructor(config = {}) {
    this.req = null;
    this.res = null;
    this.config = {
      ...config,
      rootDir: path.resolve(config.root|| process.cwd())
    }
    this.rootDir = this.config.rootDir;
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
    this.services = {
      cache: new Cache(config),
      parser: new Parser(config),
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

  handleRequest(req, res) {
    this.req = new Request(req);
    this.res = new Response(res);
    const file = this.mapUrlToFile(this.req.url);

    if (!file?.isFile) {
      this.res.statusCode = 404;
      this.res.end("page not found");
      return Promise.reject('Route not found ')
    }
    console.log('----file----', file);
    if (file.ext == 'jsx') {
      let cachePath = this.services.cache.exists(this.req.url);
      if (cachePath) {
        console.log('serving cache @', cachePath);
        return this.serveFile(this.req, this.res, cachePath);
      } else {
        console.log('bundling react component...')
        return this.services.parser.bundleReactComponent(file.path)
          .then(bundlePath => {
            let content = this.services.parser.renderReactComponent(bundlePath);
            if (!this.services.cache.set(file, content)) {
              throw new Error('Failed to cache rendered component ', bundlePath)
            }
            let cachePath = this.services.cache.path(file.url == '/' ? 'index.html' : file.url);
            return this.serveFile(req, res, cachePath)
              .catch(e => {
                console.log('failed to serve file ', cachePath)
              })
          })
          .catch(e => {
            console.log('---failed to bundle react component---', e)
          });
      }
    }
    return this.serveFile(this.req, this.res, file.path);
  }

  listen(req, res) {
    this.req = new Request(req);
    this.res = new Response(res);

    try {
      this.handleRequest(this.req, this.res);
    } catch (e) {
      console.log('there was an error \n', e)
      this.dispatch(req, res, 'error');
    }

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
   * @param url
   * @returns {string|boolean} Index file path if exists or false if not.
   */
  indexFilePath(url) {
    let indexPath = path.join(this.rootDir, url);
    if (fs.existsSync(path.join(indexPath, 'index.jsx'))) {
      return path.join(indexPath, 'index.jsx');
    } else if (fs.existsSync(path.join(indexPath, 'index.html'))) {
      return path.join(indexPath, 'index.html');
    } else {
      return false;
    }
  }

  dispatch(request, response, event) {
    if (this.routes.hasOwnProperty(event)) {
      for (route of this.routes[event]) {
        route.render();
      }
    }
  }

  mapUrlToFile(url = '/') {
    let filePath = this.filePath(url) || this.indexFilePath(url) || path.resolve(this.rootDir, url);
    if (!fs.existsSync(filePath)) {
      return false;
    }
    let stat = fs.statSync(filePath);
    let ext = util.getFileExt(filePath);
    let file = {
      ext,
      url,
      path: filePath,
      isDir: stat?.isDirectory?.(),
      isFile: stat?.isFile?.()
    }
    return file;
  }

  serveFile(req, res, filePath) {
    console.log('serving file ', filePath)
    return new Promise(resolve => {
      let ext = util.getFileExt(filePath);
      let contentType = ContentType.getByExtension(ext, 'text/html');
      let content = fs.readFileSync(filePath, {encoding: 'utf8'});
      res.setHeader('Content-Type', contentType);
      res.statusCode = 200;
      res.end(content);
      resolve({req, res})
    });
  }

  streamCache(req, res) {

  }
}
module.exports = Router;
