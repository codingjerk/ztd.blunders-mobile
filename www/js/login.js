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
            sync.ajax({
                url: app.url('session/login'),
                crossdomain:true,
                data: {
                    username: $('#login-username').val(),
                    password: $('#login-password').val(),
                },
                onDone: function(result) {
                    console.log(result);
                    if (result.status === 'ok') {
                        localStorage.setItem('api-token', result.token);
                        location.replace('training.html');
                    }
                }
            });
        });

        $('#signup-button').on('click', function() {
            sync.ajax({
                url: app.url('session/signup'),
                selector: 'signup-button',
                crossDomain:true,
                data: {
                    username: $('#signup-username').val(),
                    password: $('#signup-password').val(),
                    email: $('#signup-email').val(),
                },
                onDone: function(result) {
                    if (result.status === 'ok') {
                        localStorage.setItem('api-token', result.token);
                        location.replace('training.html');
                    }
                }
            });
        });
    })();
})();

