"use strict";

var api = {};

(function(module) {
  module.blunder = {
    get: function(args) {
      sync.repeat({
        url: settings.url('blunder/get'),
        crossDomain: true,
        data: {
          token: args.token,
          type: args.type || ''
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
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
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
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
              type: args.type || ''
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    },
    vote: function(args) {
      sync.ajax({
          url: settings.url('blunder/vote'),
          crossDomain : true,
          data: {
              token: args.token,
              blunder_id: args.blunderId,
              vote: args.vote
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    },
    favorite: function(args) {
      sync.ajax({
          url: settings.url('blunder/favorite'),
          crossDomain : true,
          data: {
              token: args.token,
              blunder_id: args.blunderId
          },
          onSuccess: args.onSuccess,
          onFail:   args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    },
    analyze: function(args){
      sync.ajax({
        url: settings.url('blunder/analyze'),
        crossDomain: true,
        data: {
          token: args.token,
          blunder_id: args.blunderId,
          line: args.line
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.long
      })
    }
  };
  module.comment = {
    send: function(args) {
      sync.ajax({
        url: settings.url('comment/send'),
        crossDomain: true,
        data: {
          token: args.token,
          blunder_id: args.blunderId,
          comment_id: args.commentId,
          user_input: args.userInput
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      })
    }
  };
  module.session = {
    rating: function(args) {
      sync.ajax({
        url: settings.url('session/rating'),
        crossDomain: true,
        data: {
          token: args.token
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      });
    },
    login: function(args) {
      sync.ajax({
          url: settings.url('session/login'),
          crossDomain: true,
          data: {
              username: args.username || '',
              password: args.password || '',
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    },
    signup: function(args) {
      sync.ajax({
          url: settings.url('session/signup'),
          crossDomain: true,
          data: {
              username: args.username || '',
              password: args.password || '',
              email: args.email || ''
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    }
  };
  module.pack = {
    info: function(args) {
      sync.ajax({
          url: settings.url('pack/info'),
          crossDomain: true,
          data: {
            token: args.token
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.normal
      });
    },
    get: function(args) {
      sync.ajax({
          url: settings.url('pack/get'),
          crossDomain: true,
          data: {
            token: args.token,
            pack_id: args.packId
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.long
      });
    },
    new: function(args){
      sync.ajax({
          url: settings.url('pack/new'),
          crossDomain: true,
          data: {
            token: args.token,
            type_name: args.typeName,
            args: args.args || {}
          },
          onSuccess: args.onSuccess,
          onFail: args.onFail,
          onAnimate: args.onAnimate,
          timeout: settings.timeout.ajax.long
      });
    },
    remove: function(args){
      sync.ajax({
        url: settings.url('pack/remove'),
        crossDomain: true,
        data: {
          token: args.token,
          pack_id: args.packId
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      })
    }
  }
  module.user = {
    ratingByDate: function(args){
      sync.ajax({
        url: settings.url('user/rating-by-date'),
        crossDomain: true,
        data: {
          token: args.token,
          interval: args.interval
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      })
    },
    blundersByDate: function(args){
      sync.ajax({
        url: settings.url('user/blunders-by-date'),
        crossDomain: true,
        data: {
          token: args.token,
          interval: args.interval
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      })
    },
    blundersCount: function(args){
      sync.ajax({
        url: settings.url('user/blunders-count'),
        crossDomain: true,
        data: {
          token: args.token
        },
        onSuccess: args.onSuccess,
        onFail: args.onFail,
        onAnimate: args.onAnimate,
        timeout: settings.timeout.ajax.normal
      })
    }
  }
})(api);
