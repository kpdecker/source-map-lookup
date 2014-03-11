var split = require('split'),
    through = require('through'),
    resolver = require('./resolver');

module.exports = function(stream) {
  function remap(buf) {
    var self = this,
        line = buf.toString(),
        ref = mapReference(line);

    if (ref) {
      this.pause();

      resolver.map(ref.file, ref.line, ref.column, function(err, source, lineNumber, column) {
        if (source) {
          self.queue(
              ref.prefix
              + (ref.name ? ref.name + ' (' : '')
              + source + ':' + lineNumber + (column && column != 1 ? ':' + column : '')
              + (ref.name ? ')' : '')
              + '\n');
        } else {
          // Something broke, ignore and output the original line
          self.queue(line + '\n');
        }
        self.resume();
      });
    } else {
      this.queue(line + '\n');
    }
  }
  return stream.pipe(split()).pipe(through(remap));
};


/*
 * Uses source map to map an execption from source maped output to input.
 */
function mapReference(pathRef) {
  var match = /^(\s+at )(?:(.*?) \((.*?)\)|(.*?))$/m.exec(pathRef),
      location = match && (match[3] || match[4]),

      // Split on :, avoiding known url constructs that have : in them
      components = location && location.split(/:(?!\/\/)(?!\d+\/)/g);

  if (match) {
    return {
      prefix: match[1],
      name: match[2],
      file: components[0],
      line: parseInt(components[1], 10),

      // Must provide col number of 1 otherwise we might get off by one errors in the output
      column: parseInt(components[2] || '1', 10)
    };
  }
}
