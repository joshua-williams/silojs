const util = require('../../src/util');

describe('Util Test Suite', () => {
  it('should convert path name to component class name', () => {
    const filePath = '/contact/follow-us-on-twitter.jsx';
    const componentName = util.fileNameToComponentName(filePath);
    expect(componentName).toBe('FollowUsOnTwitter');
  })
});
