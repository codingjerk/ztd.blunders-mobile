"use strict";

var pack = {};

(function(module) {
    module.options = null

    module.selectedPack = null

    module.packsDynamicView = null
    module.unlockedDynamicView = null

    module.remove = function(packId) {
      var args = {
        token: module.options.token(),
        packId: packId,
        onSuccess: function(result) {
          /* We want to refresh board, but sync is asyncronious and will actualy
           * remove the blunder from local database later. But we want to reload
           * so game will move to other blunder quickly. So we need to remove it
           * manually */
          lstorage.packsCollection().removeWhere({pack_id:packId})
          if(module.selectedPack == packId)
            module.options.reloadGame()

          module.sync()
        },
        onFail: function(result) {
          notify.error("Can't connect to server.<br>Check your connection");
        },
        onAnimate: module.options.onAnimate
      }

      api.pack.remove(args)
    }

    module.unlock = function(meta) {
      var args = {
        token: module.options.token(),
        typeName: meta.typeName,
        args: meta.args,
        onSuccess: function(result) {
          module.sync()
        },
        onFail: function(result) {
          notify.error("Can't connect to server.<br>Check your connection");
        },
        onAnimate: module.options.onAnimate
      }

      api.pack.new(args)
    }

    module.select = function(packId) {
      module.selectedPack = packId
      module.options.goChessboardSlide()
      module.options.reloadGame()
    }

    module.isSelected = function(packId) {
      if(module.selectedPack == null)
        return false
      return (packId == module.selectedPack);
    }

    module.canRemove = function(packId) {
      return module.unlockedInfo().length == 0
    }

    var getPackById = function(pack_id) {
      var packs = lstorage.packsCollection().find({pack_id:pack_id})
      if(packs == null)
        return null

      if(packs.length != 1)
        return null

      return packs[0]
    }

    module.unlockedInfo = function() {
      if(module.unlockedDynamicView == null)
        return []

      return module.unlockedDynamicView.data();
    }

    module.packBlundersInfo = function() {
      if(module.packsDynamicView == null)
        return []

      return module.packsDynamicView.data();
    }

    module.init = function(options) {
        module.options = options
        reloadDatabase()
    }

    var reloadDatabase = function() {
      // Prepare dynamic views
      module.packsDynamicView = lstorage.packsCollection().addDynamicView('blunder_packs');
      module.packsDynamicView.applyFind( { } )
      // Sort in order to provide exactly the same behaviour on all devices
      module.packsDynamicView.applySort( function(left, right) {
        return left.pack_id.localeCompare(right.pack_id)
      });

      module.unlockedDynamicView = lstorage.unlockedCollection().addDynamicView('unlocked_packs');
      module.unlockedDynamicView.applyFind( { } )

      // Code, which blocks user input until blunder exist
      if(lstorage.packsCollection().find({}).length == 0) {
        module.options.onEmptyDatabase(true)
        utils.ensure(settings.timeout.client.step, settings.timeout.client.infinite, function() {
          return existCurrentBlunder()
        }, function() {
          module.options.onEmptyDatabase(false)
        }, function(){
          // Never reach here
        })
      }

      module.options.onPacksChanged();
      module.sync()
    }

    /**
     * This method sync local database to remote
    */
    module.sync = function() {
        var parseUnlocked = function(unlocked) {
          lstorage.unlockedCollection().removeWhere(function(doc){return true;})
          unlocked.forEach(function(unlocked_pack){
            lstorage.unlockedCollection().insert(unlocked_pack)
            module.options.onPacksChanged()
          })
        }

        var parsePackBlunders = function(packs) {
          // If no packs, request for new random pack
          if(packs.length == 0) {
            notify.good("Downloading default random pack from server")
            module.unlock({typeName: "Random"})
            return
          }

          // Remove local packs, removed in remote
          lstorage.packsCollection().removeWhere(function(pack) {
            return (packs.indexOf(pack.pack_id) == -1);
          })

          var isAlreadyExist = function(packId) {
            if(lstorage.packsCollection().find({pack_id:packId}).length > 0)
              return true
            return false
          }

          // Calculate pack's avatar depending on it's average rating
          var generatePackAvatar = function(result) {
              if(result.data.blunders.length == 0) {
                result.data.avatar = settings.image.question
                return ;
              }

              var sum = 0
              result.data.blunders.forEach(function(blunder) {
                  sum += blunder.info.elo;
              })
              var average = Math.floor(sum / result.data.blunders.length);

              if(average < 1425) {
                result.data.avatar = settings.image.piece.black.pawn;
              } else if(average >= 1425 && average < 1525) {
                result.data.avatar = settings.image.piece.black.knight;
              } else if(average >= 1525 && average < 1725) {
                result.data.avatar = settings.image.piece.black.bishop;
              } else if(average >= 1725 && average < 2125) {
                result.data.avatar = settings.image.piece.black.rook;
              } else if(average >= 2125 && average < 2525) {
                result.data.avatar = settings.image.piece.black.queen;
              } else if(average >= 2525) {
                result.data.avatar = settings.image.piece.black.king;
              } else {
                result.data.avatar = settings.image.question;
              }
          }

          // New packs from remote
          packs.forEach(function(packId){
            if(isAlreadyExist(packId))
              return;

            api.pack.get({
              token: module.options.token(),
              packId: packId,
              onSuccess: function(result) {
                  if(isAlreadyExist(packId)) // Long time has passed, need to recheck
                    return;

                  generatePackAvatar(result)
                  console.log(result)

                  lstorage.packsCollection().insert(result.data)
                  module.options.onPacksChanged()
              },
              onFail: function(result) {
                  //notify.error("Can't connect to server.<br>Check your connection");
              }
            })
          })
        }

        api.pack.info({
          token: module.options.token(),
          onSuccess: function(result) {
            parseUnlocked(result.data.unlocked)
            parsePackBlunders(result.data.packs)
            module.options.onPacksChanged()
          },
          onFail: function(result) {
            // Run once more to after small delay
            utils.delay(settings.timeout.client.short, module.sync)
            //notify.error("Can't connect to server.<br>Check your connection");
          }
        })
    }

    module.selectAnyIfNot = function() {
      if(module.selectedPack != null && getPackById(module.selectedPack) != null)
        return;

      var packs = module.packBlundersInfo();
      if(packs.length == 0)
        return;
      module.selectedPack = packs[0]['pack_id']
      module.options.onPacksChanged()
      module.options.reloadGame()
    }

    var existCurrentBlunder = function() {
      if(module.selectedPack == null)
        return false;

      var selectedPack = getPackById(module.selectedPack)
      if(selectedPack == null)
        return false

      var blunders = selectedPack.blunders
      if(blunders.length == 0)
        return false

      return true
    }

    var ensureSelectedBlunder = function(onSuccess, onFail) {
      utils.ensure(settings.timeout.client.step, settings.timeout.client.normal, function() {
        module.selectAnyIfNot()
        return existCurrentBlunder() // What if pack empty - check!!!
      }, function() {
        onSuccess()
      }, function(){
        onFail()
      })
    }

    module.getCurrentBlunder = function(args) {
      ensureSelectedBlunder(function() {
        var selectedPack = getPackById(module.selectedPack)
        var currentBlunder = selectedPack.blunders[0].get;
        args.onSuccess({
          status:'ok',
          data: currentBlunder
        })
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
        /* This make same work as sync.repeat.
         * We must repeat querying for blunder because otherwise application
         * will be in inconsistent state
         */
        module.getCurrentBlunder(args)
      })
    }

    module.getCurrentBlunderInfo = function(args) {
      ensureSelectedBlunder(function() {
        var selectedPack = getPackById(module.selectedPack)
        var currentBlunder = selectedPack.blunders[0].info;
        args.onSuccess({
          status:'ok',
          data: currentBlunder
        })
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
        /* This make same work as sync.repeat.
         * We must repeat querying for blunder because otherwise application
         * will be in inconsistent state
         */
        module.getCurrentBlunderInfo(args)
      })
    }

    /**
     * Create a proxy function to update local storage model
     * This function modify callbacks to handle local model update
     */
    var updateInfoViewLocalOnSuccess = function(args) {
      utils.injectOnSuccess(args, function(result){
        lstorage.packsCollection().chain().update(function(pack) { //TODO: slow solution?
          //We don't use map to make selective edit
          var updateOnNeed = function(blunder) {
            if(blunder.get.id != args.blunderId)
              return;
            blunder.info = result.data
          }
          pack.blunders.forEach(updateOnNeed)
          return pack
        })
      })
    }

    var reloadPackLocallyOnError = function(args) {
      utils.injectOnSuccess(args,function(result){
        if(result.status == 'ok') return;
          // Some error in pack consistency.
          // Remove it from local and reload
          lstorage.packsCollection().removeWhere({pack_id:module.selectedPack})
          module.sync()
      })
    }

    var removeBlunderOnValidationOnSuccess = function(args) {
      utils.injectOnSuccess(args,function(result){
        if(result.status !== 'ok') return;

        // Remove validated blunder from pack
        var removeCurrentBlunderFromPack = function() {
          lstorage.packsCollection().chain().find({'pack_id':module.selectedPack}).update(function(pack) {
            var blunderMatch = function(blunder) {
              return blunder.get.id != args.blunderId;
            }
            var filteredBlunders = pack.blunders.filter(blunderMatch);
            pack.blunders = filteredBlunders
            return pack
          })
        }

        // Remove pack itself if there is no blunders in it
        var removeEmptyPacks = function() {
          // The idea is to remove all empty modules and call sync only if any change has been done
          var isPackEmpty = function(pack) {
            return pack.blunders.length == 0
          }

          /* Need to sync only if any packs got empty.
             Sync is needed to update unlock list which might be empty
             LokiJS don't support count so we make some hacking */
          var emptyPacks = lstorage.packsCollection().chain().where(isPackEmpty).data()
          if(emptyPacks.length == 0) //TODO: optimize?
            return

          lstorage.packsCollection().removeWhere(isPackEmpty)
          module.sync()
        }

        removeCurrentBlunderFromPack()
        removeEmptyPacks()
        module.options.onPacksChanged()
      })
    }

    module.validateCurrentBlunder = function(args) {
      reloadPackLocallyOnError(args)
      removeBlunderOnValidationOnSuccess(args)

      // Here goes complicate logic with buffering requests
      // Now we will so simple wrapper
      api.blunder.validate(args)  //TODO: Store into buffer
    }

    module.voteCurrentBlunder = function(args) {
      updateInfoViewLocalOnSuccess(args)

      api.blunder.vote(args) //TODO: Store into buffer
    }

    module.favoriteCurrentBlunder = function(args) {
      updateInfoViewLocalOnSuccess(args)

      api.blunder.favorite(args) //TODO: Store into buffer
    }

    module.clean = function() {
      module.selectedPack = null

      module.packsDynamicView = null
      module.unlockedDynamicView = null
      module.options.onPacksChanged()
    }

})(pack)
