const {is} = require('../src/is');

test('is.array should pass given an array', () => {
    expect(is.array([])).toBe(true);
});

test('is.array should fail given non array object types', () => {
    [{}, '', 1, true, 0, false].forEach((test) => {
        expect(is.array(test)).toBe(false);
    })
});