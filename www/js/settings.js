"use strict";

var settings = {
    server: {
        protocol: 'https',
        hostname: 'prod.chessblunders.org',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(
          settings.server.protocol,
          settings.server.hostname,
          settings.server.pathToApi,
          command
        );
    },

    timeout: {
      client: { // in seconds
        step: 200,    // Used as timeout step waiting for some event
        short: 1000,
        normal: 5000
      },
      ajax: {  // in seconds
        normal: 5000, // Normal Ajax requests.
        long: 30000   // Long Ajax requests, heavy calculations on server side.
      },
      cache: { // in minutes
        normal: 10
      },
      infinite: 1000000 // Very very long time, relativelly longer, then universe life time :)
    }
};
