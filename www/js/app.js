var app = {
    settings: {
        protocol: 'http',
        server: 'dev.ztd.io',
        pathToApi: 'api/mobile'
    }
};

var url = function(command) {
    return '{0}://{1}/{2}/{3}'.format(app.settings.protocol, app.settings.server, app.settings.pathToApi, command);
}

