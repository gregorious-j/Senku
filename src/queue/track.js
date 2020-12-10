const { prefix, COLOR_THEME } = require('../../config.json');
const { ClientStatusMessage } = require('../util/status');

class Track {
    /**
     * Represents a track in the queue
     * @param {Integer} trackCode Base 64 track code
     * @param {Object} info Info from lavalink
     * @param {Integer} startTimeMs The length of the track in ms
     * @param {String} requestedBy Who requested the track
     * @param {Boolean} volume Optional: set a specific volume for the track to play at
     * @param {Object} playlistData Extra data if track belongs in a playlist
     */

    constructor(trackCode, info, startTimeMs, requestedBy, playlistData = null) {
        this.track = trackCode;
        this.info = info;
        this.title = info.title;
        this.uri = info.uri;
        this.lengthMs = info.length
        this.startTime = startTimeMs;
        this.requestedBy = requestedBy;
        this.playlistData = playlistData;
        this.isStream = info.isStream;
        this.isSeekable = info.isSeekable;
        this.playing = false;
    }

    isPlaying(choice) {
        this.playing = choice; 
    }
}

module.exports = { Track };