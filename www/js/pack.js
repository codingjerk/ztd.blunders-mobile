var pack = {};

(function(module) {
    module.options = null

    module.db = null;
    module.packsCollection = null
    module.unlockedCollection = null
    module.selectedPack = null

    module.dynamicPacks = null
    module.dynamicUnlocked = null

    module.remove = function(packId) {
      api.pack.remove({
        token: module.options.token(),
        packId: packId,
        onSuccess: function(result) {
          module.sync()
        },
        onFail: function(result) {
              notify.error("Can't connect to server.<br>Check your connection");
        }
      })
    }

    module.unlock = function(meta) {
      api.pack.new({
        token: module.options.token(),
        typeName: meta.typeName,
        args: meta.args,
        onSuccess: function(result) {
          module.sync()
        },
        onFail: function(result) {
              notify.error("Can't connect to server.<br>Check your connection");
        }
      })
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
      return true
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
      if(module.dynamicUnlocked == null)
        return []

      return module.dynamicUnlocked.data();
    }

    module.packBlundersInfo = function() {
      if(module.dynamicPacks == null)
        return []

      return module.dynamicPacks.data();
    }

    module.init = function(options) {
      if(options) // pass without options to trigger reload database
        module.options = options

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
        module.dynamicPacks = module.packsCollection.addDynamicView('blunder_packs');
        module.dynamicPacks.applyFind( { } )

        module.dynamicUnlocked = module.unlockedCollection.addDynamicView('unlocked_packs');
        module.dynamicUnlocked.applyFind( { } )

        module.sync()
      }

      var idbAdapter = new LokiIndexedAdapter('loki');
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
            module.maintain()
          })
        }

        var parsePackBlunders = function(packs) {
          // Remove  local packs, removed in remote
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
                  module.maintain()
              },
              function(result) {
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
          },
          onFail: function(result) {
                //notify.error("Can't connect to server.<br>Check your connection");
          }
        })
        module.maintain()
    }

    /**
     * This function removes empty packs, handles special cases(no packs at all),
     * and ensures packs engine is in correct state.
     */
    module.maintain = function() {
      var removeEmptyPacks = function() {
        module.packsCollection.removeWhere(function(pack) {
          return pack.blunders.length == 0
        })
      }

      var selectAnyIfNot = function() {
        if(module.selectedPack != null && getPackById(module.selectedPack) != null)
          return;

        packs = module.packBlundersInfo();
        if(packs.length == 0)
          return;
        module.selectedPack = packs[0]['pack_id']
        module.options.reloadGame()
      }

      removeEmptyPacks()
      selectAnyIfNot()
      module.options.onPacksChanged()
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

    module.validateCurrentBlunder = function(args) {
      reloadPackLocallyOnError(args)

      // Here goes complicate logic with buffering requests
      // Now we will so simple wrapper
      ensureSelectedBlunder(function() {
        result = module.packsCollection.chain().find({'pack_id':module.selectedPack}).update(function(pack) {
          var blunderMatch = function(blunder) {
            return blunder.get.id != args.blunderId;
          }
          var filteredBlunders = pack.blunders.filter(blunderMatch);
          pack.blunders = filteredBlunders
          return pack
        })
        module.maintain()
        api.blunder.validate(args)  //TODO: Store into buffer
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
      })
    }


    var injectIntoOnSuccess = function(args, callback) {
      var onSuccesSaved = args.onSuccess
      args.onSuccess = function override(result) {
        callback(result)
        onSuccesSaved(result)
      }
    }
    /**
     * Create a proxy function to update local storage model
     * This function modify callbacks to handle local model update
     */
    var updateInfoViewLocalOnSuccess = function(args) {
      injectIntoOnSuccess(args,function(result){
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
      injectIntoOnSuccess(args,function(result){
        if(result.status == 'ok') return;
          // Some error in pack consistency.
          // Remove it from local and reload
          module.packsCollection.removeWhere({pack_id:module.selectedPack})
          module.sync()
      })
    }

    module.voteCurrentBlunder = function(args) {
      updateInfoViewLocalOnSuccess(args)

      ensureSelectedBlunder(function() {
        selectedPack = getPackById(module.selectedPack)
        currentBlunder = selectedPack.blunders[0].info;
        api.blunder.vote(args) //TODO: Store into buffer
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
      })
    }

    module.favoriteCurrentBlunder = function(args) {
      updateInfoViewLocalOnSuccess(args)

      ensureSelectedBlunder(function() {
        selectedPack = getPackById(module.selectedPack)
        currentBlunder = selectedPack.blunders[0].info;
        api.blunder.favorite(args) //TODO: Store into buffer
      }, function(){
        args.onFail({
          status: 'error',
          message: 'Pack local storage engine error'
        })
      })
    }

})(pack)
