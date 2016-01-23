var pack = {};

(function(module) {
    module.db = null;
    module.packsCollection = null
    module.unlockedCollection = null

    module.unlockedInfo = function() {
      if(module.unlockedCollection == null)
          return []

      var unlocked_packs = module.unlockedCollection.addDynamicView('unlocked_packs');
      unlocked_packs.applyFind( { } )
      //legs.applySimpleSort('legs');
      return unlocked_packs.data();
    }

    module.packBlundersInfo = function() {
      if(module.packsCollection == null)
          return []

      var blunder_packs = module.packsCollection.addDynamicView('blunder_packs');
      blunder_packs.applyFind( { } )
      //legs.applySimpleSort('legs');
      return blunder_packs.data();
    }

    module.sync = function(options) {
      function getTokenAndRedirectIfNotExist() {
          var result = localStorage.getItem('api-token');

          if (!result) {
              options.onTokenRefused();
          }

          return result;
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

        var parseUnlocked = function(unlocked) {
          module.unlockedCollection.removeWhere(function(doc){return true;})
          unlocked.forEach(function(unlocked_pack){
            module.unlockedCollection.insert(unlocked_pack)
          })
          //console.log(module.unlockedCollection.find({}))
        }

        var parsePackBlunders = function(packs) {
          packs.forEach(function(packId){
            if(module.packsCollection.find({pack_id:packId}).length != 0)
              return; // Already exist

            api.pack.get({
              token: getTokenAndRedirectIfNotExist(),
              packId: packId,
              onSuccess: function(result) {
                  console.log(result.data);
                  module.packsCollection.insert(result.data)
              },
              onFail: function(result) {console.log(result);},
            })
          })
        }

        api.pack.info({
          token: getTokenAndRedirectIfNotExist(),
          onSuccess: function(result) {
            parseUnlocked(result.data.unlocked)
            parsePackBlunders(result.data.packs)
          },
          onFail: function(result) {console.log(result);},
        })
      }

      function saveHandler() {
        console.log("saved");
      }

      var idbAdapter = new LokiIndexedAdapter('loki');
      module.db = new loki('blunders.json',
        {
          autoload: true,
          autoloadCallback : loadHandler,
          autosave: true,
          autosaveCallback: saveHandler,
          autosaveInterval: 1000,
          adapter: idbAdapter
        });
    }
})(pack)
