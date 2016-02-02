var direct = {};
var buffer = {};

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
})(direct)

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
        api.blunder.validate(args)  //Store into buffer
      },
      vote: function(args) {
        //Store into buffer
      },
      favorite: function(args) {
        //Store into buffer
      }
    }
})(buffer)
