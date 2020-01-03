const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const WebTorrent = require('webtorrent');

const { torrentToResponse, handleDownloadFolder, updateKODIMovieLibrary } = require('./helpers');
const { TORRENT_PATH } = require('./config');
const logger = require('./logger');

const client = new WebTorrent();
const PORT = 9091;
let torrentList = [];
let emitInterval = null;

server.listen(PORT);
console.log('Torrent server is running on port ', PORT);

io.on('connection', function (socket) {
  socket.emit('torrent', {data: torrentList.map(torrentToResponse)});
  logger.log({level: 'info', message: 'New device connected!'});

  socket.on('new', async ({data}) => {
    const { type, folder, link } = data;
    logger.log({level: 'info', message: 'Torrent added', additional: `type:${type}, folder:${folder}`});

    if (torrentList.includes(link)) {
      logger.log({level: 'warn', message: 'Torrent already added',});
      return;
    }

    await handleDownloadFolder(type, folder);
    client.add(link, {path: `${TORRENT_PATH}/${type}/${folder}/`}, (torrent) => {
      torrentList.push(link);

      // trigger global interval
      triggerGlobalEmit(socket);

      torrent.on('done', () => {
        socket.emit('done', {data: torrent.name});
        socket.broadcast.emit('done', {data: torrent.name});
        client.remove(link);
        updateKODIMovieLibrary();

        lastTorrentCleanup(socket, link);
      });
    })
  });


  socket.on('delete', (uri) => {
    client.remove(uri);
    lastTorrentCleanup(socket, uri);
  })
});

app.use(bodyParser.json());
app.use(express.static('./build'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/folders', (req, res) => {
  const data = require('./folderList.json')
  res.send(200, JSON.stringify({data: [...data.movies, ...data['tv-show']].map((item) => item.split('.').join(' '))}))
});

function triggerGlobalEmit(socket) {
  if (emitInterval !== null) {
    return;
  }

  emitInterval = setInterval(() => {
    const torrents = client.torrents;

    socket.emit('torrent', {data: torrents.map(torrentToResponse)});
    socket.broadcast.emit('torrent', {data: torrents.map(torrentToResponse)});
  }, 1000);
}

function lastTorrentCleanup(socket, link) {
  // remove done torrent from global list
  torrentList = torrentList.filter((item) => item !== link);

  // if no more torrents are being downloaded clear global interval
  if (torrentList.length === 0) {
    clearInterval(emitInterval);
    emitInterval = null;

    socket.emit('torrent', {data: []});
    socket.broadcast.emit('torrent', {data: []});
  }
}
