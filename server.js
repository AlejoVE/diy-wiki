const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'text/plain' }));

// Uncomment this out once you've made your first route.
// app.use(express.static(path.join(__dirname, 'client', 'build')));

// some helper functions you can use
const readFilePromise = util.promisify(fs.readFile);
const writeFilePromise = util.promisify(fs.writeFile);
const readDirPromise = util.promisify(fs.readdir);

// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;
function slugToPath(slug) {
  const filename = `${slug}.md`;
  return path.join(DATA_DIR, filename);
}
function jsonOK(res, data) {
  res.json({ status: 'ok', ...data });
}
function jsonError(res, message) {
  res.json({ status: 'error', message });
}

// If you want to see the wiki client, run npm install && npm build in the client folder,
// statically serve /client/build

app.get('/api/page/:slug', (req, res) => {
  let fileName = req.params.slug;
  let URL = slugToPath(fileName);
  readFilePromise(URL, 'utf-8')
    .then((fileContent) => {
      jsonOK(res, { body: fileContent });
    })
    .catch((err) => jsonError(res, 'Page does not exist.'));
});

app.post('/api/page/:slug', (req, res) => {
  let body = req.body.body;
  let fileName = req.params.slug;
  let URL = slugToPath(fileName);
  writeFilePromise(URL, body)
    .then(() => {
      jsonOK(res, { body: body });
    })
    .catch((err) => {
      jsonError(err, 'Could not write page.');
    });
});

app.get('/api/pages/all', async (req, res) => {
  try {
    let pages = await readDirPromise(DATA_DIR, 'utf-8');
    let list = pages.map((page) => page.replace('.md', ''));
    jsonOK(res, { pages: list });
  } catch (err) {
    jsonError(err, 'Error loading the page');
  }
});

// app.get('/api/pages/all', async (req, res) => {
//   const files = await readDir(DATA_DIR);
//   data = [];
//   files.forEach((el) => {
//     data.push(el.substring(0, el.length - 3));
//   });
//   res.json({ status: 'ok', pages: data });
// });

// GET: '/api/pages/all'
// success response: {status:'ok', pages: ['fileName', 'otherFileName']}
//  file names do not have .md, just the name!
// failure response: no failure response

// GET: '/api/tags/all'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response

// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure response

app.get('/api/page/all', async (req, res) => {
  const names = await fs.readdir(DATA_DIR);
  console.log(names);
  jsonOK(res, {});
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is serving at http://localhost:${port}`));
