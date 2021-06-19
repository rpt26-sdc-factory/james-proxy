require('newrelic');
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
  HTML: (url = '', productId = 1, name) => {
    return axios.get(`${url}/${productId}/innerHTML`)
    .then(
      (results) => {
        return {
          name,
          html: results.data
        };
      }, (error) => {
        console.log('failed to get html from service at', url);
      }
    );
  },
  JS: (url, bundleName) => {
    return axios.get(`${url}/${bundleName}.js`).then((results) => {
      return renderFunctions.arrowWrapper(results.data);
    }).catch((err) => {
      console.log('failed to get js from service at', url);
    })
  },
  arrowWrapper: (str) => {
    return typeof str !== 'string' && typeof str !== undefined ?
      `(() => {${str.toString()}})();` :
      `(() => {${str}})();` ;
  },
  divReplacer: (html, data, id) => {
    return html.replace(`<div id="${id}"></div>`, `<div id="${id}">${data}</div>`);
  }
}

app.get('/:id', (req, res, next) => {
  if (isNaN(req.params.id)) {
    next();
    return;
  }
  console.log(req.params.id);
  read(`${__dirname}/../public/index.html`, {encoding: 'utf8'} ).then(html => {
    html = html.replace('<meta http-equiv="refresh" content="0; URL=/1" />','');
    var renderPromises = [
      renderFunctions.HTML(urls.about, req.params.id, 'about'),
      //renderFunctions.HTML(urls.title, req.params.id, 'title'),
      renderFunctions.HTML(urls.instructors, req.params.id, 'instructors'),
      renderFunctions.HTML(urls.syllabus, req.params.id, 'syllabus'),
    ];

    Promise.allSettled(renderPromises).then((promises) => {
      var datas = [];
      promises.forEach((promise) => {
        promise.value ? datas.push(promise.value) : null;
      });
      html = datas.reduce((html, curData) => {
        return renderFunctions.divReplacer(html, curData.html, curData.name);
      }, html);
      res.send(html);
    })
  })
});

app.get('/index.js', (req, res) => {
  var renderPromises = [
    read(`${__dirname}/../public/index.js`, {encoding: "utf-8"}).then(renderFunctions.arrowWrapper),
    renderFunctions.JS(urls.about, 'index'),
    //renderFunctions.JS(urls.title, 'bundle'), //incompatible with my ssr
    //renderFunctions.JS(urls.instructors, 'bundle'), //error in code
    renderFunctions.JS(urls.syllabus, 'bundle')
  ];

  Promise.allSettled(renderPromises).then(promises => {
    let datas = [];
    promises.forEach(promise => {
      promise.value !== undefined ? datas.push(promise.value.toString()) : null;
    });
    return datas.join('\n//end of JS Source \n');
  }).then(js => {
    res.status(200).send(js);
  })
})

app.use(express.static(path.resolve(__dirname, '../public')));



app.listen(PORT, () => {
  console.log(`Proxy listening at port ${PORT}`);
});
