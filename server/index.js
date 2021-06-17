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
  title:        process.env.TITLEURL       || 'http://localhost:3001',
  about:        process.env.ABOUTURL       || 'http://localhost:3002',
  instructors:  process.env.INSTRUCTORSURL || 'http://localhost:3003',
  syllabus:     process.env.SYLLABUSURL    || 'http://localhost:3005'
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const renderFunctions = {
  HTML: (url = '', productId = 1, divId = '') => {
    return axios.get(`${url}/${productId}/innerHTML`).then((results) => {
      html = html.replace(`<div id="${divId}"></div>`, `
        <div id="${divId}">${results.data}</div>
      `);
    })
  },
  JS: (url, bundleName) => {
    return axios.get(`${url}/${bundleName}.js`).then((results) => {
      return `(() => {${results.data}})()`;
    }).catch(() => {
      console.log('failed to get js from about service');
    })
  }
}

app.get('/:id', (req, res, next) => {
  if (isNaN(req.params.id)) {
    next();
    return;
  }
  read(`${__dirname}/../public/index.html`, {encoding: 'utf8'} ).then(html => {
    var renderPromises = [
      renderFunctions.HTML(urls.about, req.params.id, 'about'),
      renderFunctions.HTML(urls.title, req.params.id, 'about'),
      renderFunctions.HTML(urls.instructors, req.params.id, 'about'),
      renderFunctions.HTML(urls.syllabus, req.params.id, 'about'),
    ];

    Promise.all(renderPromises).then(() => {
      res.send(html);
    })
  })
});

app.get('/index.js', (req, res) => {
  var renderPromises = [
    renderFunctions.JS(urls.about, 'index'),
    renderFunctions.JS(urls.about, 'index'),
    renderFunctions.JS(urls.about, 'index'),
    renderFunctions.JS(urls.about, 'index'),
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
