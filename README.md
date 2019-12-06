# Torrent server for KODI

For KODI to scrape movies or tv-shows they need to be sorted to corresponding folder.

[Add-on:Universal Movie Scraper
](https://kodi.wiki/view/Add-on:Universal_Movie_Scraper)

```
> movie
  > Deadpool
  > Iron.Man.2

> tv-show
  > The.Big.Bang.Theory
```

### config file
add `config.js` file to root of the project with following structure:
```
module.exports.TORRENT_PATH = [absolute path to save folder]];
```

