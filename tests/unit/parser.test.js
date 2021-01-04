const fs = require('fs');
const path = require('path');
const Parser = require('../../src/parser');
const rootDir = path.join(path.dirname(__dirname), 'sandbox')

describe('Parser Test Suite', () => {

  let parser = null;

  describe('React Components', () => {
    beforeEach(() => {
      parser = new Parser({root: rootDir});
    });

    it('should bundle react component', () => {
      let componentPath = path.join(rootDir, 'shop/products/perfume.jsx');
      let cachePath = path.join(rootDir, '.silo/cache/shop/products/perfume.jsx');
      return parser.bundleReactComponent(componentPath)
        .finally(() => {
          expect(fs.existsSync(cachePath)).toBe(true);
        });
    });

    it('should render react component from commonjs default export', () => {
      let componentPath = path.join(rootDir, 'shop/products/perfume.jsx');
      let content = parser.renderReactComponent(componentPath);
      expect(content).toBeTruthy();
    })

    it('should render react component from commonjs named export', () => {
      let componentPath = path.join(rootDir, 'shop/products/shoes.jsx');
      let content = parser.renderReactComponent(componentPath);
      const expected = '<section data-reactroot=""><h1>Shoes</h1></section>';
      expect(content).toEqual(expected)
    })

    it('should render react component from named es6 export', () => {
      let componentPath = path.join(rootDir, 'shop/products/index.jsx');
      let content = parser.renderReactComponent(componentPath);
      expect(content).toBeTruthy();
    });

    it('should render react component from default es6 export', () => {
      let componentPath = path.join(rootDir, 'shop/products/t-shirts.jsx');
      let content = parser.renderReactComponent(componentPath);
      console.log(content)
      expect(content).toBeTruthy();
    });
  });
});