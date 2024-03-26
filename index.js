const express = require("express");
const cookieParser = require('cookie-parser');
const { promises: fs }  = require("fs");

const AUDIO_EXTS = ['mp3', 'opus'];
const VIDEO_EXTS = ['mkv', 'mp4', 'webm'];


const app = express();

app.use(cookieParser());

app.use((req, res, next) => {
  res.cookie('data_key', 'videoTime');
  next();
});

app.use(
  '/',
  express.static('static', {extensions: ['html']}),
  express.static('media'),
);

app.get(['/', ''], (req, _, next) => {
  req.url = '/index.html';
  next();
});

app.get('/delete', async function(req, resp) {
  const filename = req.query.v.substr(1);
  if (filename) {
    const files = await fs.readdir('media');
    files.filter(f => f.startsWith(filename)).forEach(f => fs.unlink('media/' + f));
   }
  resp.sendStatus(204);
});


app.get('/media/*', async function(req, res, next) {
  const path ='.' + decodeURIComponent(req.path);

  try {
    const contents = await fs.readdir(
      path,
      { withFileTypes: true },
    )

    res.send(contents.map(
      x => {
        let type;
        if (x.isDirectory() || x.isSymbolicLink()) {
          type = 'D';
        } else if (AUDIO_EXTS.some(e => x.name.endsWith(e))) {
          type = 'A';
        } else if (VIDEO_EXTS.some(e => x.name.endsWith(e))) {
          type = 'V';
        }
        return { name: x.name, type };
      }
    ).filter(x => !!x.type && !x.name.startsWith('_')));
  } catch (e) {
    res.status(500).send(e);
  }
});

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});
