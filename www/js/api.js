var api = {
  blunder: {
    get: function(args) {
      sync.repeat({
        url: settings.url('blunder/get'),
        crossDomain: true,
        data: {
          token: args.token,
          type: 'rated'
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate
      });
    },
    info: function(args) {
      sync.repeat({
          url: settings.url('blunder/info'),
          crossDomain : true,
          data: {
              token: args.token,
              blunder_id: args.blunderId
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate
      });
    },
    validate: function(args) {
      sync.repeat({
          url: settings.url('blunder/validate'),
          crossDomain : true,
          data: {
              token: args.token,
              id: args.blunderId,
              line: args.pv,
              spentTime: args.spentTime,
              type: 'rated'
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate
      });
    }

  },
  session: {
    rating: function(args) {
      sync.ajax({
        url: settings.url('session/rating'),
        crossDomain: true,
        data: {
          token: args.token
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate
      });
    }
  }
};
