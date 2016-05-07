var settings = {
    server: {
        protocol: 'http',
        hostname: '37.48.109.169:8089',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(settings.server.protocol, settings.server.hostname, settings.server.pathToApi, command);
    }
};
