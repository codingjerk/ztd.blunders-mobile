"use strict";

var settings = {
    server: {
        protocol: 'https',
        hostname: 'prod.chessblunders.org',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(settings.server.protocol, settings.server.hostname, settings.server.pathToApi, command);
    }

    timeout: {
      step: 200,        // Used as timeout step waiting for some event
      short: 5000,      // Ordinary wait
      long: 60000,      // Long wait for some slow event
      inginite: 1000000 // Very very long time, relativelly longer, then universe life time :)
    }
};
