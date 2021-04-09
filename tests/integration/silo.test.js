describe('silo.js test suite', () => {
  let app;
  beforeEach(() => {


  })
  it('should export Router object', () => {
    const BaseRouter = require('../../src/router')
    const {Router} = require('../../index');
    expect (BaseRouter.constructor.name).toEqual(Router.constructor.name)
  })
})