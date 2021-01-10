const path = require('path');
const Cache = require('../cache')
const util = require('../util');
const Parser = require('../parser')
const { Command } = require('commander');
const program = new Command();
let cache, parser = null;

const clearCache = filePath => {
  const cleared = cache.clear(filePath);
  if (cleared) {
    let message = filePath ? `cleared cache @ ${filePath}` : 'cleared cache';
    return console.log(message);
  } else {
    return console.log('no cache cleared')
  }
}

const cacheFile = filePath => {
  const extension = util.getFileExt(filePath);
  if (extension !== 'jsx') {
    return;
  }
  const reactComponentPath = path.resolve(filePath);
  if (!reactComponentPath) {
    console.error('file does not exist ' + reactComponentPath);
    return;
  }
  parser.bundleReactComponent(reactComponentPath)
    .then(() => {
      const cachePath = cache.path(filePath);
      const content = parser.renderReactComponent(cachePath);
      const cached = cache.set(filePath, content);
      if (cached) {
        console.log('content cached @ ' + cachePath);
      } else {
        console.log('failed to cache @ ' + cachePath);
      }
    })
    .catch(e => {
      console.log(['failed to cache file', e]);
    })
}

program
  .name('cache')
  .description('Start silo application')
  .arguments('[filePath]')
  .option('--clear', 'Clear cache')
  .option('-d, --debug', 'Debug application')
  .action(filePath => {
    cache = new Cache();
    parser = new Parser();

    if (program.clear) {
      clearCache(filePath)
    } else {
      cacheFile(filePath)
    }
  })

module.exports = program;