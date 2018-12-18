const path = require('path');
const template = require('../src/template');

describe('Template class test suite', () => {

  test('template should render from file', () => {
    let tpl = template()
      .setPath(path.resolve(__dirname, 'assets/template.html'))
      .
  });
});