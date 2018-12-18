const fs = require('fs');
const path = require('path');
const engine = require('../src/engine');

test('engine.interpolate string should interpolate javascript expressions', () => {
  let templateString     = 'Hi, my name is ${user.first} ${user.last}';
  let user               = {
    first: 'Joshua',
    last: 'Williams',
    name: function () {
      return `${this.first} ${this.last}`;
    }
  };
  let templateModel      = engine.model('user', user);
  let interpolatedString = engine.interpolate(templateString, templateModel);
  let expectedString     = 'Hi, my name is Joshua Williams';

  expect(expectedString).toBe(interpolatedString);

});


