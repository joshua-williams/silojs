const fs = require('fs');
const path = require('path');
const engine = require('../src/engine');

test('engine.interpolate string should interpolate javascript expressions', () => {
  let templateString     = 'Hi, my name is ${me.first} ${me.last}';
  let templateModel      = engine.model('me', {first:'Joshua', last:'Williams'});
  let interpolatedString = engine.interpolate(templateString, templateModel);
  let expectedString     = 'Hi, my name is Joshua Williams';

  expect(expectedString).toBe(interpolatedString);
});


