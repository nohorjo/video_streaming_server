const express = require("express");
const cookieParser = require('cookie-parser');
const { createReadStream, promises: fs }  = require("fs");
const mime = require('mime-types');

const AUDIO_EXTS = ['mp3', 'opus'];
const VIDEO_EXTS = ['mkv', 'mp4', 'webm'];

const EXTS = [...AUDIO_EXTS, ...VIDEO_EXTS];

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


app.get(`/media/*.(${EXTS.join('|')})`, async function(req, res) {
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  const filePath = decodeURIComponent(req.path);
  try {
    const fileSize = (await fs.stat(filePath)).size;

    if (!fileSize) {
      res.sendStatus(404);
      return;
    }

    streamFile({
      res,
      range,
      filePath,
      fileSize,
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

app.get('/media/*', async function(req, res, next) {
  const path ='.' + decodeURIComponent(req.path);

  try {
    if ((await fs.stat(path)).isFile()) {
      next();
    } else {
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
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

function streamFile({
  res,
  range,
  fileSize,
  filePath,
  chunkSize = 10 ** 6, // 1MB
}) {
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, fileSize - 1);

  // HTTP Status 206 for Partial Content
  res.writeHead(206, {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    "Content-Type": mime.lookup(filePath),
  });

  // create video read stream for this particular chunk
  // Stream the video chunk to the client
  createReadStream(filePath, { start, end }).pipe(res);
}

app.listen(8000, function() {
  console.log("Listening on port 8000!");
});
