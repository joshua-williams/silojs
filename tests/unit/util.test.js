const util = require('../../src/util');

describe('Util Test Suite', () => {
  it('should get the file extension from url string', () => {
    const url = 'http://wpsite.com/images/logo.png';
    let ext = util.getFileExtension(url);
    expect(ext).toEqual('png');
  });

  it('should convert path name to component class name', () => {
    const filePath = '/contact/follow-us-on-twitter.jsx';
    const componentName = util.fileNameToComponentName(filePath);
    expect(componentName).toBe('FollowUsOnTwitter');
  })
});
