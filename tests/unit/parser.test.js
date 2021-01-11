const fs = require('fs');
const path = require('path');
const Parser = require('../../src/parser');
const Cache = require('../../src/cache');
const rootDir = path.join(path.dirname(__dirname), 'sandbox')

describe('Parser Test Suite', () => {
  let parser = null;
  let cache = null;

  describe('React Components', () => {
    beforeAll(() => {
      parser = new Parser({root: rootDir});
      cache = new Cache({root: rootDir})
    });

    it('should bundle react component', () => {
      let componentPath = path.join(rootDir, 'shop/products/perfume.jsx');
      let cachePath = parser.bundlePath('shop/products/perfume.jsx');
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
    });

    it('should render react component from named es6 export', () => {
      let componentPath = path.join(rootDir, 'shop/products/index.jsx');
      let content = parser.renderReactComponent(componentPath);
      expect(content).toBeTruthy();
    });

    it('should render react component from default es6 export', () => {
      let componentPath = path.join(rootDir, 'shop/products/t-shirts.jsx');
      let content = parser.renderReactComponent(componentPath);
      expect(content).toBeTruthy();
    });

    describe('import rendered component', () => {
      beforeAll(() => {
        let paths = [
          path.join(rootDir, '/shop/products/perfume.jsx'),
          path.join(rootDir, 'shop/products/shoes.jsx'),
          path.join(rootDir, 'shop/products/t-shirts.jsx')
        ]
        let promises = paths.map(path => parser.bundleReactComponent(path))
        return Promise.all(promises)
      });

      it('should import rendered react component from commonjs default export', () => {
        let componentPath = parser.bundlePath('shop/products/perfume.jsx');
        let component = require(componentPath);
        expect(component).toBeInstanceOf(Function)
      });

      it('should import rendered react component from commonjs named export', () => {
        let componentPath = parser.bundlePath('shop/products/t-shirts.jsx');
        let {TShirts} = require(componentPath);
        expect(TShirts).toBeInstanceOf(Function)
      });
      it('should import rendered react component from es6 default export', () => {
        let componentPath = parser.bundlePath('shop/products/shoes.jsx');
        let component = parser.loadComponent(componentPath);
        expect(component).toBeInstanceOf(Function)
      });
      it('should import rendered react component from es6 named export', () => {
        let componentPath = parser.bundlePath('shop/products/shoes.jsx');
        let component = parser.loadComponent(componentPath)
        expect(component).toBeInstanceOf(Function)
      });
    })
  });
});