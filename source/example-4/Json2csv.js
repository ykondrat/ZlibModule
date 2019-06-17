// Core
import fs from 'fs';
import { extname } from 'path';
import { EventEmitter } from 'events';
import zlib from 'zlib';
import { pipeline } from 'stream';

class Json2csv extends EventEmitter {
  constructor (props) {
    super(props);

    this.files = [];
    this.#init();
  }

  add (path, abandon, archive = null) {
    this.#validatePath(path);
    this.#validateAbandon(abandon);

    if (archive) {
      this.#validateArchive(archive);
    }

    this.files.push({
      abandon,
      path,
      archive,
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
      let streamData = '';

      readStream.on('data', (chunk) => {
        streamData += chunk.toString();
      });

      readStream.on('end', () => {
        const data = JSON.parse(streamData);
        const headers = Object.keys(data[0]).filter(item => file.abandon.includes(item));
        let str = this.#createCSVHeaders(headers);

        str += this.#addJsonData(data, headers);

        writeStream.write(str, 'utf-8');
        writeStream.end();

        if (file.archive) {
          const { algorithm } = file.archive;
          const read = fs.createReadStream(file.convertedPath);
          const write = fs.createWriteStream(`${file.convertedPath}.gz`);
          let zip = null;

          if (algorithm === 'deflate') {
            zip = zlib.createDeflate();
          } else {
            zip = zlib.createGzip();
          }

          pipeline(
            read,
            zip,
            write,
            (error) => {
              if (error) {
                this.emit('error', error);
              }
            }
          );
        }
      });

      file.converted = true;

      return file;
    });
  }

  #createCSVHeaders (headers) {
    let str = '';

    headers.forEach((item, index) => {
      if (index === headers.length - 1) {
        str += `${('' + item).replace(/\n/g, ' ')}\n`;
      } else {
        str += `${('' + item).replace(/\n/g, ' ')};`;
      }
    });

    return str;
  }

  #addJsonData (data, headers) {
    let str = '';

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

    return str;
  }

  #getListener (pathToFind, cb) {
    this.#validateCallBack(cb);
    const file = this.files.find(({ path }) => path === pathToFind);

    if (!file) {
      this.emit('error', new Error(`No such file with path: ${pathToFind}`));
    }

    cb(file);
  }

  #removeListener (pathToFind) {
    const file = this.files.find(({ path }) => path === pathToFind);

    if (!file) {
      this.emit('error', new Error(`No such file with path: ${pathToFind}`));
    }

    if (file.converted) {
      fs.unlink(file.convertedPath, (error) => {
        if (error) {
          throw error;
        }
      });
    }

    this.files = this.files.filter((item) => item.path !== pathToFind);
  }

  #validateArchive (archive) {
    if (typeof archive !== 'object') {
      this.emit('error', new TypeError(`archive is not a object`));
    }
    const { algorithm } = archive;
    const allowedFields = [
      'algorithm',
    ];
    const allowedValue = [
      'deflate',
      'gzip',
    ];

    if (!algorithm || typeof algorithm !== 'string' || !allowedValue.includes(algorithm)) {
      this.emit('error', new TypeError(`algorithm does not exist or contains not a valid data type`));
    }
    for (const key in archive) {
      if (Object.prototype.hasOwnProperty.call(archive, key)) {
        const isExist = allowedFields.some(field => field === key);

        if (!isExist) {
          this.emit('error', new TypeError(`archive contains not allowed field — ${key}`));
        }
      }
    }
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
