module.exports.is = {
    array    : v => ( Object.prototype.toString.call(v)=='[object Array]' ),
    string   : v => ( typeof(v) == 'string' ),
    function : v => ( typeof(v)=='function' ),
    object   : v => ( Object.prototype.toString.call(v)=='[object Object]' ),
    element  : v => ( Object.prototype.toString.call(v).trim().match(/html(?:[a-z]+)?element/i) ),
    input    : v => ( Object.prototype.toString.call(v)=='[object HTMLInputElement]' ),
    textarea : v => ( Object.prototype.toString.call(v)=='[object HTMLTextAreaElement]' ),
    select   : v => ( Object.prototype.toString.call(v)=='[object HTMLSelectElement]' ),
    number   : v => {
      switch (typeof(v)) {
          case 'numeric':
            return true;
          case 'string':
            return v.match(/^[0-9]+$/);
          default:
            return false;
      }
    }
}
