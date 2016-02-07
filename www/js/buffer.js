var direct = {};

(function(module) {
    module.blunder = {
      get: function(args) {
        args.type = 'rated'
        api.blunder.get(args)
      },
      info: function(args) {
        api.blunder.info(args)
      },
      validate: function(args) {
        args.type = "rated"
        api.blunder.validate(args)
      },
      vote: function(args) {
        api.blunder.vote(args)
      },
      favorite: function(args) {
        api.blunder.favorite(args)
      }
    }
    module.session = {
      rating: function(args) {
        api.blunder.rating(args)
      },
      login: function(args) {
        api.blunder.login(args)
      },
      signup: function(args) {
        api.blunder.signup(args)
      }
    };
})(direct)

var buffer = {};

(function(module) {
    module.blunder = {
      get: function(args) {
        pack.getCurrentBlunder(args)
      },
      info: function(args) {
        pack.getCurrentBlunderInfo(args)
      },
      validate: function(args) {
        args.type = "pack"
        pack.validateCurrentBlunder(args)
      },
      vote: function(args) {
        pack.voteCurrentBlunder(args)
      },
      favorite: function(args) {
        //Store into buffer
      }
    }
    module.session = {
      rating: function(args) {
        //api.blunder.rating(args)
      },
      login: function(args) {
        //api.blunder.login(args)
      },
      signup: function(args) {
        //api.blunder.signup(args)
      }
    };
})(buffer)
