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
          module.packsCollection.removeWhere({pack_id:packId})
          module.options.onPacksChanged()
          module.sync()
        },
        onFail: function(result) {console.log(result);},
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
        onFail: function(result) {console.log(result);},
      })
    }

    module.select = function(packId) {
      module.selectedPack = packId
      module.options.goChessboardSlide()
    }

    module.isSelected = function(packId) {
      if(module.selectedPack == null)
        return false
      return (packId == module.selectedPack);
    }

    module.canRemove = function(packId) {
      // For now, only disable removing last pack
      if(module.packBlundersInfo().length <= 1)
        return false
      return true
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

    var getRandomPack = function() {
        api.pack.new({
          token: module.options.token(),
          typeName: "Random",
          onSuccess: function(result) {
            module.select(result.data.pack_id)
            module.sync()
          },
          onFail: function(result) {console.log(result);},
        })
    }

    module.sync = function() {
        var parseUnlocked = function(unlocked) {
          module.unlockedCollection.removeWhere(function(doc){return true;})
          unlocked.forEach(function(unlocked_pack){
            module.unlockedCollection.insert(unlocked_pack)
            module.options.onPacksChanged()
          })
        }

        var parsePackBlunders = function(packs) {
          packs.forEach(function(packId){
            if(module.packsCollection.find({pack_id:packId}).length != 0)
              return; // Already exist

            api.pack.get({
              token: module.options.token(),
              packId: packId,
              onSuccess: function(result) {
                  module.packsCollection.insert(result.data)
                  module.options.onPacksChanged()
              },
              onFail: function(result) {console.log(result);},
            })
          })
        }

        api.pack.info({
          token: module.options.token(),
          onSuccess: function(result) {
            parseUnlocked(result.data.unlocked)
            parsePackBlunders(result.data.packs)
            if(result.data.packs.length == 0)
              getRandomPack() //If user have no packs, download at least one pack
          },
          onFail: function(result) {console.log(result);},
        })
    }
})(pack)
