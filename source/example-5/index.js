const fs = require('fs');
const path = require('path');
const util = require('util');

const dirname = path.join(__dirname, 'files');
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const bundleFile = path.join(__dirname, 'build/bundle.js');
const appendFile = util.promisify(fs.appendFile);

const init = async () => {
  let files = await readdir(dirname);

  fs
    .watch(dirname, async (eventType, filename) => {
      if (path.extname(filename) === '.js') {
        if (eventType === 'rename') {
          const newFiles = await readdir(dirname);

          if (files.includes(filename) && !newFiles.includes(filename)) {
            files = newFiles;

            fs.truncate(bundleFile, 0);

            // files.forEach(async (file) => {
            //   try {
            //     const data = await readFile(path.join(dirname, file));
            //     await appendFile(bundleFile, data);
            //   } catch (error) {
            //     throw error;
            //   }
            // });
          } else if (files.includes(filename) && newFiles.includes(filename)) {
            files = newFiles;

            fs.truncate(bundleFile, 0);

            // files.forEach(async (file) => {
            //   try {
            //     const data = await readFile(path.join(dirname, file));
            //     await appendFile(bundleFile, data);
            //
            //   } catch (error) {
            //     throw error;
            //   }
            // });
          } else {
            // try {
            //   const data = await readFile(path.join(dirname, filename));
            //   await appendFile(bundleFile, data);
            //
            //   files = newFiles;
            // } catch (error) {
            //   throw error;
            // }
          }
        }
      }
    });
};

init();
