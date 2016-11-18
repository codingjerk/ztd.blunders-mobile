var storage = {};

(function(module) {
    module.db = null;
    module.options = null
    module.readyFlag = false

    module.get = function() {
      return module.db
    }

    module.ready = function() {
      return module.readyFlag == true;
    }

    module.init = function(options) {
        module.options = options
    }

    module.restart = function() {
      utils.ensure(200, 5000, function() {
        return module.options != undefined
      }, function() {
        reloadDatabase()
      }, function(){
        notify.error('Storage engine: local storage error')
      })
    }

    var reloadDatabase = function() {
      module.readyFlag = false;

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
        module.readyFlag = true
      }

      var saveHandler = function() {
        // Empty
      }

      console.log('blunders-user-' + module.options.token() + '.json')
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

})(storage)
