(function() {
    'use strict';

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
                url: 'http://{0}/api/session/login'.format(app.settings.server),
                method: 'POST',
                crossDomain: true,
                contentType: 'application/json',
                data: JSON.stringify({
                    username: $('#login-username').val(),
                    password: $('#login-password').val()
                }),
                success: function(result) {
                    // @TODO: Do something with cookies
                    console.log(result);
                    if (result.status === 'ok') {
                        location.replace('training.html');
                    }
                }
            });
        });

        $('#signup-button').on('click', function() {
            $('#pages').dragend({
                scrollToPage: 1
            });
        });
    })();
})();