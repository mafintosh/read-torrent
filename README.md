# read-torrent

read and parse a torrent from a resource

	npm install read-torrent

# usage

``` js
var readTorrent = require('read-torrent');

readTorrent('http://my-server.com/file.torrent', function(err, torrent) {
	// we loaded a torrent from a server
});

readTorrent('mydir/file.torrent', function(err, torrent) {
	// we loaded a torrent from a file
});
```

The torrent result looks like this

``` js
{
	name: 'torrent name',
	created: new Date(...),
	announce: [
		// list of annouce urls
	],
	infoHash: 'infoHash as a hex string',
	files: [{
		name: 'name of file',
		path: 'suggested file path',
		offset: absoluteOffset,
		length: lengthOfFile
	}],
	pieceLength: lengthOfAPiece,
	pieces: [
		'hex string of a sha1 hash of a piece'
	]
}
```