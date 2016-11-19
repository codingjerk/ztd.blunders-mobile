/*
  The idea is, that direct and pack modules provides completely the same
  functionality from perspective of board module and just can be replaced
*/


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
    module.comment = {
      send: function(args) {
        api.comment.send(args)
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
    module.user = {
      ratingByDate: function(args) {
        api.user.ratingByDate(args)
      },
      blundersByDate: function(args) {
        api.user.blundersByDate(args)
      },
      blundersCount: function(args) {
        api.user.blundersCount(args)
      }
    }
})(direct)

var cache = function(tag, callback, args, minutes) {
  cached = lstorage.cacheCollection().where(function(el) {
    console.log((new Date() - new Date(el['date']))/1000/60)
    if(el['tag'] != tag) return false;
    if((new Date() - new Date(el['date']))/1000/60 > minutes) return false // minutes
    return true;
  })

  if(cached.length > 0) { // is good to use
    result = cached[0]['result']
    args.onSuccess(result)
    //console.log('exist')
  }
  else {
    lstorage.cacheCollection().removeWhere({'tag':tag})
    utils.injectOnSuccess(args, function(result){
      lstorage.cacheCollection().insert({'tag':tag, 'result': result, 'date':new Date()})
    })
    callback(args)
    //console.log('not exist')
  }
}

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
        pack.favoriteCurrentBlunder(args)
      }
    }
    module.comment = {
      send: function(args) {
        api.comment.send(args)
      }
    }
    module.session = {
      rating: function(args) {
        api.session.rating(args)
      },
      login: function(args) {
        api.session.login(args)
      },
      signup: function(args) {
        api.session.signup(args)
      }
    };
    module.user = {
      ratingByDate: function(args) {
        cache('ratingByDate',api.user.ratingByDate, args, 10)
      },
      blundersByDate: function(args) {
        cache('blundersByDate',api.user.blundersByDate, args, 10)
      },
      blundersCount: function(args) {
        cache('blundersCount',api.user.blundersCount, args, 10)
      }
    }
})(buffer)
