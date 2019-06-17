// Core
import path from 'path';

import Json2csv from './example-1/Json2csv';

const json2csv = new Json2csv();

// path.resolve(__dirname, './data/comments.json')
json2csv.add(path.resolve(__dirname, './data/comments.json'), ['postId', 'name', 'body']);

json2csv.on('error', (error) => {
  console.log(error);
});
json2csv.emit('start');
// json2csv.emit('remove', path.resolve(__dirname, './data/comments.json'));
// json2csv.emit('get',path.resolve(__dirname, './data/comments.json'), (data) => {
//   console.log(data);
// });
