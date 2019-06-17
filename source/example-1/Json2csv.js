// Core
import fs from 'fs';
import { extname } from 'path';
import { EventEmitter } from 'events';
import Manager from './Manager';

class Json2csv extends EventEmitter {
  constructor (props) {
    super(props);

    this.manager = new Manager();
    this.files = [];
    this.#init();
  }

  add (path) {
    this.#validatePath(path);

    this.files.push({
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
        const headers = Object.keys(data[0]);
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
              if (key === headers[headers.length - 1]) {
                str += `${('' + item[key]).replace(/\n/g, ' ')}\n`;
              } else {
                str += `${('' + item[key]).replace(/\n/g, ' ')};`;
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
