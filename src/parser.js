const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const babelConfig = require('../babel.config');
const Cache = require('./cache');
const ReactDomServer = require('react-dom/server');
const React = require('react');
const util = require('./util')

 module.exports = class Parser {

    constructor(config = {}) {
      this.rootDir = config.root || process.cwd();
      this.services = {
        cache: new Cache({root: this.rootDir})
      }
    }

    renderReactComponent(componentPath) {
      const ComponentName = util.fileNameToComponentName(componentPath);
      const Module = require(componentPath);
      const Component = Module[ComponentName] || Module;
      let component = null;
      if (typeof Component == 'function') {
        if (Component?.prototype?.render) {
          component = new Component();
          component = component.render();
        } else {
          component = Component();
        }
      } else if (typeof Component == 'object') {
          component = Component?.default() || Component?.[ComponentName]()
      }
      const content = ReactDomServer.renderToString(component);
      return content;
     }

    bundleReactComponent(componentPath) {
      const relativePath = componentPath.replace(this.rootDir, '');
      const componentCachePath = this.services.cache.path(relativePath);
      const library = path.basename(componentPath.replace(/\.\w+$/, ''));
      const config = {
        mode: "development",
        entry: componentPath,
        output: {
          path: path.dirname(componentCachePath),
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
          console.log(stats.toString({
            chunks: false,
            colors: true
          }));
          resolve(true);
        });
      });
    }
 }