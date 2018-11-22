const fs = require('fs');
const {is} = require('./is');

class Engine {

  constructor(options) {
    this.path =  is.string(options.path) || false;
    this.content = is.string(options.content) || false;

  }

  setPath(path) {
    this.path = path;
    return this;
  }

  setContent(content) {
    this.content = content;
    return this;
  }

  render() {

  }
}

class TemplateModel {};

const model = (name, model) => {
  if (!name) {
    throw new Error('Template Model requires a name');
  }
  if (!is.object(model)) {
    throw new Error('Template Model requires model')
  }
  var templateModel = new TemplateModel();
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
  Object.assign(templateModel, model);
  return templateModel;
};

const interpolate = (templateString, templateModel = {}) => {
  let isTemplateModel = templateModel instanceof TemplateModel;
  if (!isTemplateModel) {
    throw new Error('Model must be instance of silo Model')
  }
  let fn = new Function(templateModel.name, 'return `' + templateString + '`');
  return fn(templateModel.data);

};

const interpolateFile = (templatePath, templateModel) => {
    let templateString = fs.readFileSync(path.resolve(templatePath), 'utf8');
    interpolate(templateString, templateModel);
};


module.exports.interpolate = interpolate;
module.exports.model = model;