(function() {
    'use strict';

    if (localStorage.getItem('api-token')) {
        location.replace('training.html');
    }

    (function prepareLibs() {
        $("#pages").dragend();

        $.support.cors = true;
    })();

    (function setupListeners() {
        $('#go-to-signup-button').on('click', function() {
            $('#pages').dragend({
                scrollToPage: 2
            });
        });

        $('#login-button').on('click', function() {
            $.ajax({
                url: 'http://{0}/{1}/session/login'.format(app.settings.server, app.settings.pathToApi),
                method: 'POST',
                crossDomain: true,
                contentType: 'application/json',
                data: JSON.stringify({
                    username: $('#login-username').val(),
                    password: $('#login-password').val(),
                }),
                success: function(result) {
                    if (result.status === 'ok') {
                        localStorage.setItem('api-token', result.token);
                        location.replace('training.html');
                    }
                }
            });
        });

        $('#signup-button').on('click', function() {
            $.ajax({
                url: 'http://{0}/{1}/session/signup'.format(app.settings.server, app.settings.pathToApi),
                method: 'POST',
                crossDomain: true,
                contentType: 'application/json',
                data: JSON.stringify({
                    username: $('#signup-username').val(),
                    password: $('#signup-password').val(),
                    email: $('#signup-email').val(),
                }),
                success: function(result) {
                    if (result.status === 'ok') {
                        localStorage.setItem('api-token', result.token);
                        location.replace('training.html');
                    }
                }
            });
        });
    })();
})();