// Core
import { Transform } from 'stream';

class Manager extends Transform {
  constructor (options = {
    readableObjectMode: true,
    writableObjectMode: true,
    decodeStrings:      false,
  }) {
    super(options);

    this.data = '';
  }

  _transform (chunk, encoding, done) {
    this.push(this.data);
    this.data += chunk.toString();
    done();
  }

  _flush (done) {
    // console.log('_flush', done);
    done();
  }
}

export default Manager;
