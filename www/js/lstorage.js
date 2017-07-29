"use strict";

var lstorage = {};

(function(module) {
    module.db = null;

    // Defining collections
    module._packsCollection = null
    module._unlockedCollection = null
    module._cacheCollection = null

    module.options = null

    module.packsCollection = function() {
      return module._packsCollection
    }

    module.unlockedCollection = function() {
      return module._unlockedCollection
    }

    module.cacheCollection = function() {
      return module._cacheCollection
    }

    module.init = function(options, callback) {
        module.options = options
        reloadDatabase(callback)
    }

    var reloadDatabase = function(callback) {
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

      var loadHandler = function() {
        // if database did not exist it will be empty so I will intitialize here
        module._packsCollection = module.db.getCollection('blunders');
        if (module._packsCollection === null) {
          module._packsCollection = module.db.addCollection('blunders');
        }
        module._unlockedCollection = module.db.getCollection('unlocked');
        if (module._unlockedCollection === null) {
          module._unlockedCollection = module.db.addCollection('unlocked');
        }
        module._cacheCollection = module.db.getCollection('cache');
        if (module._cacheCollection === null) {
          module._cacheCollection = module.db.addCollection('cache');
        }

        callback()
      }

      var saveHandler = function() {
        // Empty
      }

      // We do not want filename of cache databases have user's token in it
      // So we make some obfuscation to this string
      // TODO: find more reliable hash function and move it to utils module as prototype
      var hashCode = function(str){
        var hash = 0;
        if (str.length == 0) return hash;
        for (var i = 0; i < str.length; i++) {
            var char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
      }

      var hash = Math.abs(hashCode(module.options.token()))
      module.db = new loki('blunders-user-' + hash + '.json',
        {
          autoload: true,
          autoloadCallback : loadHandler,
          autosave: true,
          autosaveCallback: saveHandler,
          autosaveInterval: settings.timeout.client.short,
          adapter: idbAdapter
        });

      module.clean = function() {
        module.db = null
        module._packsCollection = null
        module._unlockedCollection = null
        module._cacheCollection = null
      }
    }

})(lstorage)
