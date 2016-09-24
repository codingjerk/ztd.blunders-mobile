var sync = {};

(function initModule(module) {
    var syncTemplate = '<i class="fa fa-circle-o-notch fa-spin"></i>';

    var simple_ajax = function(args) {
        $.ajax({
            type: args.type || 'POST',
            crossDomain: args.crossDomain || false,
            url: args.url,
            contentType: args.contentType || 'application/json',
            data: JSON.stringify(args.data)
        }).done(function(data) {
            args.onSuccess && args.onSuccess(data);
        }).fail(function(data) {
            args.onFail && args.onFail(data);
        }).always(function(data) {
            args.onDone && args.onDone(data);
        });
    }

    module.ajax = function(args) {
        if(args.onAnimate === undefined) {
            simple_ajax(args);
            return;
        }

        if (args.onAnimate.busy) return;
        args.onAnimate.busy = true;

        setTimeout(function() {
            if (!args.onAnimate.busy) return;

            args.onAnimate.animated = true;
            args.onAnimate(true);
        }, 100);

        simple_ajax({
            url: args.url,
            type: args.type,
            contentType: args.contentType,
            crossDomain : args.crossDomain,
            data: args.data,
            onDone: function(result) {
                args.onAnimate.busy = false;

                if (args.onAnimate.animated) {
                    args.onAnimate(false);
                }

                args.onDone && args.onDone(result);
            },
            onSuccess: function(result) {
                args.onSuccess && args.onSuccess(result);
            },
            onFail: function(result) {
                args.onFail && args.onFail(result);
            }
        });
    };

    module.repeat = function(args) {
        (function makeTry() {
            module.ajax({
                onAnimate: args.onAnimate,
                url: args.url,
                type: args.type,
                contentType: args.contentType,
                crossDomain: args.crossDomain,
                data: args.data,
                onDone: args.onDone,
                onSuccess: args.onSuccess,
                onFail: function() {
                    args.onFail();
                    setTimeout(makeTry, args.timeout || 1000);
                }
            });
        })();
    };
})(sync);
