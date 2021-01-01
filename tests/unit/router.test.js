const path = require('path')
const Router = require('../../src/router');
const http = require('http')

describe('Router Test Suite', () => {
  let router;

  beforeEach(() => {
    let root = path.join(path.dirname(__dirname), 'sandbox');
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
    it('should get the file extension from url string', () => {
      const url = 'http://wpsite.com/images/logo.png';
      let ext = router.fileExtension(url);
      expect(ext).toEqual('png');
    });
    it('should get html index from url path', () => {
      const url = '/'
      const indexPath = router.indexPath(url);
      expect(indexPath).not.toBe(false);
      expect(indexPath).toEqual(router.rootDir + '/index.html')
    });
    it('should get jsx index from url path', () => {
      const url = '/shop/products'
      const indexPath = router.indexPath(url);
      expect(indexPath).not.toBe(false);
      expect(indexPath).toEqual(router.rootDir + '/shop/products/index.jsx')
    });
  });
});