const path = require('path');
const webpack = require('webpack');
const babelConfig = require('../babel.config');
const Cache = require('./cache');
const ReactDomServer = require('react-dom/server');
const util = require('./util')

 module.exports = class Parser {

    constructor(config = {}) {
      this.rootDir = config.root && path.resolve(config.root) || process.cwd();
      this.services = {
        cache: new Cache({root: this.rootDir})
      }
    }

    loadComponent(componentPath) {
      const ComponentName = util.fileNameToComponentName(componentPath);
      const Module = require(componentPath);
      const Component = Module[ComponentName] || Module;
      return  Component?.default ?? Component;
    }

    renderReactComponent(componentPath) {
      const Component = this.loadComponent(componentPath);
      let component = null;
      if (typeof Component == 'function') {
        // To support Class Components
        if (Component?.prototype?.render) {
          component = new Component();
          component = component.render();
        // To support pure function components
        } else {
          component = Component();
        }
      } else {
        console.log('--typeof component----',  Component)
      }
      const content = ReactDomServer.renderToString(component);
      console.log('-----react content------', content, component)
      return content;
     }

    bundleReactComponent(componentPath) {
      const relativePath = componentPath.replace(this.rootDir, '');
      const bundlePath = path.join(this.rootDir, '.silo/bundles', relativePath);
      const library = util.fileNameToComponentName(componentPath)
      const config = {
        target: "node",
        mode: "development",
        entry: componentPath,
        output: {
          path: path.dirname(bundlePath),
          filename: path.basename(componentPath),
          library,
          libraryTarget: 'umd',
          umdNamedDefine: true,
        },
        module: {
          rules:[
            {
              test: /\.jsx$/,
              use: {
                loader: 'babel-loader',
                options: babelConfig
              }
            }
          ]
        }
      }

      return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
          if (err) {
            console.log('error: ', err);
            return reject(false);
          }
          resolve(bundlePath);
        });
      });
    }
    bundlePath(subPath) {
      let bundlePath = path.resolve(this.rootDir, '.silo/bundles');
      if (subPath && typeof subPath === 'string') {
        return path.join(bundlePath, subPath);
      } else {
        return bundlePath
      }
    }
 }