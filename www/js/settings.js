"use strict";

var settings = {
    api: {
        //protocol: 'https',
        //hostname: 'prod.chessblunders.org',
        protocol: 'http',
        hostname: 'dev2.chessblunders.org:8089',
        resource: 'api/mobile'
    },

    coach: {
        protocol: 'http',
        hostname: 'dev2.chessblunders.org:8090',
        resource: 'chat',
        enabled: false // Coach is optional feature
    },

    urlAPI: function(command) {
        return '{0}://{1}/{2}/{3}'.format(
          settings.api.protocol,
          settings.api.hostname,
          settings.api.resource,
          command
        );
    },

    urlCoach: function() {
        return '{0}://{1}/{2}'.format(
          settings.coach.protocol,
          settings.coach.hostname,
          settings.coach.resource
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
