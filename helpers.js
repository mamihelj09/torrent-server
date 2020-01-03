const fs = require('fs');
const dayjs = require('dayjs');

const { TORRENT_PATH } = require('./config');
const logger = require('./logger');

/**
 *
 * @param {
  * magnetURI: string
  * name: string
  * progress: number
  * downloaded: number
  * downloadSpeed: number
  * numPeers: number
  * uploadSpeed: number
  * timeRemaining: number
 * } torrent
 * @returns
 *
 */
function torrentToResponse(torrent) {
  const { magnetURI, name, progress, downloaded, downloadSpeed, numPeers, uploadSpeed, timeRemaining } = torrent;
  return {
    uri: magnetURI,
    name,
    progress: Math.round(progress * 100 * 100) / 100,
    downloaded: (downloaded / 1000000).toFixed(2),
    total: (torrent.length  / 1000000).toFixed(2),
    downloadSpeed: (downloadSpeed / 1000).toFixed(2),
    peers: numPeers,
    uploadSpeed: (uploadSpeed / 1000).toFixed(2),
    timeRemaining: dayjs(timeRemaining).subtract(1, 'hour').format('HH:mm:ss')
  }
}

/**
 *
 * @param {string} type - "movie" | "tv-show"
 * @param {string} folder
 * @returns void
 *
 * check if movie/tv show folder exist and creates it
 *
 */
async function handleDownloadFolder(type, folder) {
  return new Promise(async (resolve, reject) => {
    try {
      const rootFolders = await fs.promises.readdir(TORRENT_PATH);
      console.log(rootFolders)
      if (!rootFolders.includes(type)) {
        await fs.promises.mkdir(`${TORRENT_PATH}/${type}`);
      }

      const typeFolder = await fs.promises.readdir(`${TORRENT_PATH}/${type}`);
      if (!typeFolder.includes(folder)) {
        await fs.promises.mkdir(`${TORRENT_PATH}/${type}/${folder}`);
      }

      const folderList = require('./folderList.json');
      if (!folderList[type].includes(folder)) {
        folderList[type].push(folder);
        await fs.promises.writeFile('./folderList.json', JSON.stringify(folderList), 'utf8');
      }
      logger.log({level: 'info', message: 'Folder created', additional: `type:${type}, folder:${folder}`});

      resolve();
    } catch(e) {
      console.log(e)
      logger.log({level: 'error', message: 'Creating folder', additional: e});
      reject();
    }
  })
}

module.exports = {
  torrentToResponse,
  handleDownloadFolder
}
