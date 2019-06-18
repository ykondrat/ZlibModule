const fs = require('fs');
const path = require('path');
const util = require('util');

const dirname = path.join(__dirname, 'files');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const bundleFile = path.join(__dirname, 'build/bundle.js');

const rebuild = (dir) => {
  fs.unlink(bundleFile, (err) => {
    if (err) {
      throw err;
    }
    dir.forEach((file) => {
      readFile(path.join(dirname, file)).then((fileData) => {
        fs.appendFile(bundleFile, fileData.toString(), (error) => {
          if (error) {
            throw error;
          }
        });
      });
    });
  });
};

const init = async () => {
  let files = await readdir(dirname);

  fs
    .watch(dirname, (eventType, filename) => {
      if (path.extname(filename) === '.js') {
        if (eventType === 'rename') {
          readdir(dirname).then(((data) => {
            if (files.includes(filename) && !data.includes(filename)) {
              rebuild(data);
            } else if (files.includes(filename) && data.includes(filename)) {
              rebuild(data);
            } else {
              readFile(path.join(dirname, filename)).then((fileData) => {
                fs.appendFile(bundleFile, fileData.toString(), (err) => {
                  if (err) {
                    throw err;
                  }
                });
              });
            }
            files = data;
          }));
        }
      }
    });
};

init();
