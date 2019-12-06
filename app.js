const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const server = require('http').Server(app);
const io = require('socket.io')(server);
const WebTorrent = require('webtorrent');

const { torrentToResponse, handleDownloadFolder } = require('./helpers');
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

    await handleDownloadFolder(type, folder);
    client.add(link, {path: `${TORRENT_PATH}/${type}/${folder}/`}, (torrent) => {
      const interval = setInterval(() => {
        const torrentName = torrent.name;
        const torrentIndex = torrentList.findIndex((item) => item.name === torrent.name);
        if (torrentIndex > -1) {
          torrentList[torrentIndex] = torrent;
        } else {
          torrentList.push(torrent);
        }

        // trigger global interval
        triggerGlobalEmit(socket);

        if (torrent.progress === 1) {
          socket.emit('done', {data: torrentName});
          socket.broadcast.emit('done', {data: torrentName});

          // remote done torrent
          torrentList = torrentList.filter((item) => item.name !== torrent.name);
          // clear torrent list update interval
          clearInterval(interval);

          // if no more torrents are being downloaded clear global interval
          if (torrentList.length === 0) {
            clearInterval(emitInterval);
          }
        }
      }, 1000);

      socket.on(`delete:${torrent.name}`, () => {
        clearInterval(interval);
        torrentList = torrentList.filter((item) => item.name !== torrent.name);

        if (torrentList.length === 0) {
          clearInterval(emitInterval);
        }
      });
    })
  })
});

app.use(bodyParser.json());
app.use(express.static('./build'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.get('/folders', (req, res) => {
  const data = require('./folderList.json')
  res.send(200, JSON.stringify({data: [...data.movie, ...data.show].map((item) => item.split('.').join(' '))}))
});

function triggerGlobalEmit(socket) {
  if (emitInterval !== null) {
    return;
  }

  emitInterval = setInterval(() => {
    socket.emit('torrent', {data: torrentList.map(torrentToResponse)});
    socket.broadcast.emit('torrent', {data: torrentList.map(torrentToResponse)});
  }, 1000);
}
