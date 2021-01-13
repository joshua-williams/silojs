const path = require('path')
const Router = require('../../src/router');
const Request = require('../../src/request');
const Response = require('../../src/response');
const http = require('http')

describe('Router Test Suite', () => {
  let router, req, res;

  beforeEach(() => {
    req = new Request();
    res = new Response();
    const root = path.join(path.dirname(__dirname), 'sandbox');
    router = new Router({root});
  });

  describe('Test Request URL File Mapping', () => {
    it('should get the jsx file path from url string', () => {
      let url = '/shop/specials';
      let filePath = router.filePath(url);
      expect(filePath).toEqual(router.rootDir + '/shop/specials.jsx')
    });
    it('should get the html file path from url string', () => {
      let url = '/shop/clearance';
      let filePath = router.filePath(url);
      expect(filePath).toEqual(router.rootDir + '/shop/clearance.html')
    });
    it('should get html index from url path', () => {
      const url = '/'
      const indexPath = router.indexFilePath(url);
      expect(indexPath).not.toBe(false);
      expect(indexPath).toEqual(router.rootDir + '/index.html')
    });
    it('should get jsx index from url path', () => {
      const url = '/shop/products'
      const indexPath = router.indexFilePath(url);
      expect(indexPath).not.toBe(false);
      expect(indexPath).toEqual(router.rootDir + '/shop/products/index.jsx')
    });
    it('should serve html file', () => {
      const filePath = path.join(router.rootDir, 'shop/clearance.html');
      spyOn(res, 'send');
      router.serveFile(req, res, filePath);
      expect(res.send).toHaveBeenCalled();
      expect(res.contentType()).toEqual('text/html')
    });
  });

  describe('Handle Request', () => {
    it('should serve html content', () => {
      req.url = '/shop/clearance'
      return router.handleRequest(req, res)
        .then(() => {
          expect(res.body).toBeTruthy()
        })
    });

    it('should serve react component', () => {
      req.url = '/shop/products/shoes';
      return router.handleRequest(req, res)
        .then(() => {
          expect(res.body).toBeTruthy()
        })
    });
  });
  describe('Handle 404', () => {
    it('should send 404 response', () => {
      let path = '/path/not/found'
      router.handleRequest(req, res);
      expect(res.statusCode).toBe(404);
    })
  })
});