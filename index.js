const Express = require('express');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const im = require('gm').subClass({imageMagick: true});
const readFile = promisify(fs.readFile);

const app = new Express();
const size = 8;

app.get([/\/$/, /\.html?$/], async (req, res) => {
  let filepath = req.url;
  if(filepath.endsWith('/'))
    filepath += 'index.html';
  const buffer = await readFile(path.join('./static', filepath));
  let markup = buffer.toString();

  markup = markup.split(/(<img [^>]+>)/g)
    .map(async part => {
      if(!part.startsWith('<img ')) return part;

      const attributes = part.slice(4, -1);
      const file = /src="([^"]+)"/.exec(attributes)[1];
      const image = im(path.join('./static', file));
      const {width, height} = await (promisify(image.size.bind(image))());

      const buffer = await (promisify(image.resize(size, size).toBuffer.bind(image))('PNG'));
      return `<sc-img style="padding-top: ${height/width*100}%; background-image: url(data:image/png;base64,${buffer.toString('base64')});" ${attributes}></sc-img>`
    });

  markup = await Promise.all(markup);
  res.send(markup.join(''));
});

app.use(Express.static('static'));

app.listen(8080);
