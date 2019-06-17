// Core
import fs from 'fs';
import { extname } from 'path';
import { EventEmitter } from 'events';

class Json2csv extends EventEmitter {
  constructor (props) {
    super(props);

    this.manager = new Manager();
    this.files = [];
    this.#init();
  }

  add (path, abandon) {
    this.#validatePath(path);
    this.#validateAbandon(abandon);

    this.files.push({
      abandon,
      path,
      converted:     false,
      convertedPath: path.replace(/.json/, '.csv'),
    });

    return this;
  }

  #init () {
    this.on('start', this.#startListener);
    this.on('get', this.#getListener);
    this.on('remove', this.#removeListener);
  }

  #startListener () {
    this.files = this.files.map((file) => {
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(file.convertedPath);

      readStream.pipe(this.manager).on('finish', () => {
        const data = JSON.parse(this.manager.data);
        const headers = Object.keys(data[0]).filter(item => file.abandon.includes(item));
        let str = '';

        headers.forEach((item, index) => {
          if (index === headers.length - 1) {
            str += `${item.replace(/\n/g, ' ')}\n`;
          } else {
            str += `${item.replace(/\n/g, ' ')};`;
          }
        });

        data.forEach((item) => {
          for (const key in item) {
            if (item.hasOwnProperty(key)) {
              if (headers.includes(key)) {
                if (key === headers[headers.length - 1]) {
                  str += `${('' + item[key]).replace(/\n/g, ' ')}\n`;
                } else {
                  str += `${('' + item[key]).replace(/\n/g, ' ')};`;
                }
              }
            }
          }
        });

        writeStream.write(str, 'utf-8');
        writeStream.end();
      });
    });
  }

  #getListener (pathToFind, cb) {
    this.#validateCallBack(cb);
    const file = this.files.find(({ path }) => path === pathToFind);

    if (!file) {
      this.emit('error', new Error(`No such file with path: ${pathToFind}`));
    }

    cb(file);
  }

  #removeListener () {

  }

  #validateAbandon (abandon) {
    if (!Array.isArray(abandon)) {
      this.emit('error', new TypeError(`abandon is not a array`));
    }
    abandon.forEach(item => {
      if (typeof item !== 'string') {
        this.emit('error', new TypeError(`item of abandon is not a string`));
      }
    });
  }

  #validatePath (path) {
    fs.access(path, fs.constants.F_OK, error => {
      if (error) {
        this.emit('error', new Error(`file '${path}' does not exist`));
      }
      if (extname(path) !== '.json') {
        this.emit('error', new TypeError(`file '${path}' include invalid extension`));
      }
    });
  }

  #validateCallBack (cb) {
    if (typeof cb !== 'function') {
      this.emit('error', new TypeError(`cb is not a function`));
    }
  }
}



export default Json2csv;
