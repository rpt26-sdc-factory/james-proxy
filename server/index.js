const { promisify } = require('util');
const express = require('express');
const path = require('path');
const fs = require('fs');
var read = promisify(fs.readFile);
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

const axios = require('axios');

require('dotenv').config();


var urls = {
  About: process.env.ABOUTURL || 'http://localhost:3002'
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/:id', (req, res, next) => {
  if (isNaN(req.params.id)) {
    next();
    return;
  }
  read(`${__dirname}/../public/index.html`, {encoding: 'utf8'} ).then(html => {
    var renderPromises = [
      axios.get(`${urls.About}/${req.params.id}/innerHTML`).then((results) => {
        html = html.replace(`<div id="about"></div>`, `
          <div id="about">${results.data}</div>
        `);
      })
    ];

    Promise.all(renderPromises).then(() => {
      res.send(html);
    })
  })
});

app.get('/index.js', (req, res) => {
  var renderPromises = [
    axios.get(`${urls.About}/index.js`).then((results) => {
      return `(() => {${results.data}})()`;
    }).catch(() => {
      console.log('failed to get js from about service');
    })
  ];

  Promise.all(renderPromises).then(jsArr => {
    return jsArr.join('\n');
  }).then(js => {
    res.status(200).send(js);
  })
})

app.use(express.static(path.resolve(__dirname, '../public')));



app.listen(PORT, () => {
  console.log(`Proxy listening at port ${PORT}`);
});
