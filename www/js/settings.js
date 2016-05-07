var settings = {
    server: {
        protocol: 'https',
        hostname: 'prod.chessblunders.org',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(settings.server.protocol, settings.server.hostname, settings.server.pathToApi, command);
    }
};
