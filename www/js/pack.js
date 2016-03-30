var pack = {};

(function(module) {
    module.options = null

    module.db = null;
    module.packsCollection = null
    module.unlockedCollection = null
    module.selectedPack = null

    module.packsDynamicView = null
    module.unlockedDynamicView = null

    module.remove = function(packId) {
      args = {
        token: module.options.token(),
        packId: packId,
        onSuccess: function(result) {
          /* We want to refresh board, but sync is asyncronious and will actualy
           * remove the blunder from local database later. But we want to reload
           * so game will move to other blunder quickly. So we need to remove it
           * manually */
          module.packsCollection.removeWhere({pack_id:packId})
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
      args = {
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
      packs = module.packsCollection.find({pack_id:pack_id})
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
    }

    module.restart = function() {
      var currentBlunder = utils.ensure(200, 5000, function() {
        return module.options == undefined
      }, function() {
        restart()
      }, function(){
        notify.error('Pack engine: local storage error')
      })
    }

    var restart = function() {
      function saveHandler() {
        console.log("saved");
      }

      function loadHandler() {
        // if database did not exist it will be empty so I will intitialize here
        module.packsCollection = module.db.getCollection('blunders');
        if (module.packsCollection === null) {
          module.packsCollection = module.db.addCollection('blunders');
        }
        module.unlockedCollection = module.db.getCollection('unlocked');
        if (module.unlockedCollection === null) {
          module.unlockedCollection = module.db.addCollection('unlocked');
        }

        // Prepare dynamic views
        module.packsDynamicView = module.packsCollection.addDynamicView('blunder_packs');
        module.packsDynamicView.applyFind( { } )
        // Sort in order to provide exactly the same behaviour on all devices
        module.packsDynamicView.applySort( function(left, right) {
          return left.pack_id.localeCompare(right.pack_id)
        });

        module.unlockedDynamicView = module.unlockedCollection.addDynamicView('unlocked_packs');
        module.unlockedDynamicView.applyFind( { } )

        module.options.onPacksChanged();
        module.sync()
      }

      var idbAdapter = null
      /*
       * When using in browser, IndexedAdapter is great. Hovewer,
         on Android device we have an issue when database initialises, load handler not called.
         http://stackoverflow.com/questions/27735568/phonegap-web-sql-database-creation-error-no-such-table-cachegroups
         For cordova, running on device, we use another adapter, as suggested here
         http://gonehybrid.com/how-to-use-lokijs-for-local-storage-in-your-ionic-app/
       */
      if(window.cordova) // TODO:is this the best way to check this?
        idbAdapter = new LokiCordovaFSAdapter({"prefix": "loki"});
      else {
        idbAdapter = new LokiIndexedAdapter({"prefix": "loki"});
      }

      module.db = new loki('blunders-user-' + module.options.token() + '.json',
        {
          autoload: true,
          autoloadCallback : loadHandler,
          autosave: true,
          autosaveCallback: saveHandler,
          autosaveInterval: 1000,
          adapter: idbAdapter
        });
    }

    /**
     * This method sync local database to remote
    */
    module.sync = function() {
        var parseUnlocked = function(unlocked) {
          module.unlockedCollection.removeWhere(function(doc){return true;})
          unlocked.forEach(function(unlocked_pack){
            module.unlockedCollection.insert(unlocked_pack)
            module.options.onPacksChanged()
          })
        }

        var parsePackBlunders = function(packs) {
          // Remove local packs, removed in remote
          module.packsCollection.removeWhere(function(pack) {
            return (packs.indexOf(pack.pack_id) == -1);
          })

          // New packs from remote
          packs.forEach(function(packId){
            if(module.packsCollection.find({pack_id:packId}).length > 0)
              return; // Already exist

            api.pack.get({
              token: module.options.token(),
              packId: packId,
              onSuccess: function(result) {
                  module.packsCollection.insert(result.data)
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
            //notify.error("Can't connect to server.<br>Check your connection");
          }
        })
    }

    module.selectAnyIfNot = function() {
      if(module.selectedPack != null && getPackById(module.selectedPack) != null)
        return;

      packs = module.packBlundersInfo();
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
      var currentBlunder = utils.ensure(200, 5000, function() {
        module.selectAnyIfNot()
        return !existCurrentBlunder() // What if pack empty - check!!!
      }, function() {
        onSuccess()
      }, function(){
        onFail()
      })
    }

    module.getCurrentBlunder = function(args) {
      ensureSelectedBlunder(function() {
        selectedPack = getPackById(module.selectedPack)
        currentBlunder = selectedPack.blunders[0].get;
        args.onSuccess({
          status:'ok',
          data: currentBlunder
        })
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
      })
    }

    module.getCurrentBlunderInfo = function(args) {
      ensureSelectedBlunder(function() {
        selectedPack = getPackById(module.selectedPack)
        currentBlunder = selectedPack.blunders[0].info;
        args.onSuccess({
          status:'ok',
          data: currentBlunder
        })
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
      })
    }

    /**
     * Create a proxy function to update local storage model
     * This function modify callbacks to handle local model update
     */
    var updateInfoViewLocalOnSuccess = function(args) {
      utils.injectOnSuccess(args, function(result){
        module.packsCollection.chain().update(function(pack) { //TODO: slow solution?
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
          module.packsCollection.removeWhere({pack_id:module.selectedPack})
          module.sync()
      })
    }

    var removeBlunderOnValidationOnSuccess = function(args) {
      utils.injectOnSuccess(args,function(result){
        if(result.status !== 'ok') return;

        // Remove validated blunder from pack
        var removeCurrentBlunderFromPack = function() {
          module.packsCollection.chain().find({'pack_id':module.selectedPack}).update(function(pack) {
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
          var emptyPacks = module.packsCollection.chain().where(isPackEmpty).data()
          if(emptyPacks.length == 0) //TODO: optimize?
            return

          module.packsCollection.removeWhere(isPackEmpty)
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

})(pack)
