const fs = require('fs');
const path = require('path');
const Cache = require('../../src/cache');

describe('Cache Test Suite', () => {

  let cache = null;
  let root = path.join(path.dirname(__dirname), 'sandbox');

  beforeEach(() => {
    cache = new Cache({root});
  });

  it('should create .silo/cache directory', () => {
    return cache.makeCacheDirectory()
      .then(response => {
        expect(response).toBe(true)
      })
      .catch(e => {
        console.log(e)
      })
  });
  it('should clear cache', () => {
    expect(cache.clear()).toBe(true);
  });
  it('should cache file', () => {
    let html = 'export default props => (<h1>Contact Us</h1>)';
    let filePath = '/contact/index.jsx';
    cache.set(filePath, html);
    let exists = fs.existsSync(cache.path(filePath));
    expect(exists).toBe(true)
  });
  it('should get contents of cached file', () => {
    let content = cache.get('/contact/index.jsx');
    let html = 'export default props => (<h1>Contact Us</h1>)';
    expect(content.toString()).toEqual(html)
  })
  it('should clear cache of single file', () => {
    let filePath = '/contact/index.html';
    cache.clear(filePath);
    let exists = fs.existsSync(filePath);
    expect(exists).toBe(false)
  });

});