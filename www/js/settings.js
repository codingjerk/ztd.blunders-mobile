var settings = {
    server: {
        protocol: 'http',
        hostname: 'dev2.chessblunders.org:8089',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(settings.server.protocol, settings.server.hostname, settings.server.pathToApi, command);
    }
};
