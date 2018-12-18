const fs   = require('fs');
const path = require('path');
const is   = require('./is');

class Template {

  constructor(options = {}) {
    this.path = options.path || false;
    this.content = options.content || false;
    this.model = options.model || {};
  }
  render() {

  }

  setPath(path) {
    this.path = path;
    return this;
  }

  setContent(content) {
    this.content = content;
    return this;
  }
  setModel(model) {
    this.model = model;
    return this;
  }
}


class TemplateModel {}
/**
 *
 * @param name string required
 * @param model object required
 * @returns {TemplateModel}
 */
const model = (name, model = {}) => {
  if (!name) {
    throw new Error('Template Model requires a name');
  }
  if (!is.object(model)) {
    //throw new Error('Template Model parameter requires model object')
  }

  var templateModel = new TemplateModel();
  Object.assign(templateModel, model);

  Object.defineProperty(templateModel, 'name', {
    get: function() {
      return name;
    }
  });
  Object.defineProperty(templateModel, 'data', {
    get: function() {
      return model
    }
  });

  return templateModel;
};

const each = (collection = [], fnMarkup) => {
  if (!is.array(collection)) {
    throw new Error('collecton parameter requires array object');
  }
  if (!is.function(fnMarkup)) {
    throw new Error('second each paramater must be function');
  }
  let str = '';
  collection.forEach((item) => {
    str += fnMarkup(item);
  });
  return str;
}

const interpolate = (templateString, ...templateModels) => {
  let models = templateModels
    .filter(model => model instanceof TemplateModel)
    .map(model => model.data);

  for (var a = 0, modelNames = ['each']; a < templateModels.length; a++) {
    modelNames.push(templateModels[a].name);
  }
  let fn = new Function(modelNames.join(','), 'return `' + templateString + '`');
  return fn(...[each,...models], );
};

const interpolateFile = (templatePath, ...templateModels) => {
  let templateString = fs.readFileSync(path.resolve(templatePath), 'utf8');
  return interpolate(templateString, ...templateModels);
};


module.exports.interpolate = interpolate;
module.exports.interpolateFile = interpolateFile;
module.exports.model = model;
module.exports.template = () => new Template();