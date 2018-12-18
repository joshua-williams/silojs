module.exports.array = v => ( Object.prototype.toString.call(v)=='[object Array]' );
module.exports.string = v => ( typeof(v) == 'string' );
module.exports.function = v => ( typeof(v)=='function' );
module.exports.object = v => ( Object.prototype.toString.call(v)=='[object Object]' );
module.exports.element = v => ( Object.prototype.toString.call(v).trim().match(/html(?:[a-z]+)?element/i) );
module.exports.input = v => ( Object.prototype.toString.call(v)=='[object HTMLInputElement]' );
module.exports.textarea = v => ( Object.prototype.toString.call(v)=='[object HTMLTextareaElement]' );
module.exports.select = v => ( Object.prototype.toString.call(v)=='[object HTMLSelectElement]' );
module.exports.number = v => {
  switch (typeof(v)) {
    case 'numeric':
      return true;
    case 'string':
      return v.match(/^[0-9]+$/);
    default:
      return false;
  }
};
