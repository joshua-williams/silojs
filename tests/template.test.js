const path = require('path');
const fs = require('fs');
const {template} = require('../index');

describe('Template class test suite', () => {
  test('template should render from file', () => {
    let expecedHtml = fs.readFileSync(path.resolve(__dirname, 'assets/template.expected.html'), 'utf8');
    let templatePath = path.resolve(__dirname, 'assets/template.html');
    let html = template()
      .setPath(templatePath)
      .addModel('page', {title: 'Title Test'})
      .render();
    expect(html).toEqual(expecedHtml);

  });

  test('template should thrown error when rendering file that does not exist', () => {
    let templatePath = path.resolve(__dirname, 'assets/doesNotExist.html');
      var tpl = template()
        .setPath(templatePath)
        .addModel('page', {title: 'Title Test'});
      expect(tpl.render).toThrow(Error);
  });

  test('template should catch a thrown error when rendering file that does not exist', () => {
    let templatePath = path.resolve(__dirname, 'assets/doesNotExist.html');
    var tpl = template()
      .setPath(templatePath)
      .addModel('page', {title: 'Title Test'})
      .catch(e => {
        expect(e.name).toBe('Error');
      })
      .render()
  });
});