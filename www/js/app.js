var app = {
    settings: {
        protocol: 'https',
        server: 'ssl.ztd.io',
        pathToApi: 'api/mobile'
    },

    url: function(command) {
        return '{0}://{1}/{2}/{3}'.format(app.settings.protocol, app.settings.server, app.settings.pathToApi, command);
    }
};

