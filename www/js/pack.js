var pack = {};

(function(module) {
    module.db = null;
    module.blundersCollection = null
    module.unlockedCollection = null

    module.unlockedInfo = function() {
      if(module.unlockedCollection == null)
          return [{id:6, description:"dfdfdf"}]

      var legs = module.unlockedCollection.addDynamicView('legs');
      legs.applyFind( { } )
      //legs.applySimpleSort('legs');
      return legs.data();
    }

    module.fullSync = function(options) {
      function getTokenAndRedirectIfNotExist() {
          var result = localStorage.getItem('api-token');

          if (!result) {
              options.onTokenRefused();
          }

          return result;
      }

      function loadHandler() {
        // if database did not exist it will be empty so I will intitialize here
        module.blundersCollection = module.db.getCollection('blunders');
        if (module.blundersCollection === null) {
          module.blundersCollection = module.db.addCollection('blunders');
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
          console.log(module.unlockedCollection.find({}))
        }

        api.pack.info({
          token: getTokenAndRedirectIfNotExist(),
          onSuccess: function(result) {
            parseUnlocked(result.data.unlocked)
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
