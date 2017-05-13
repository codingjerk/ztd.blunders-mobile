"use strict";

var message = {};

(function(module) {
    module.options = null
    module.messages = []
    module.connected = false

    module.socket = null;

    module.coachMessagesInfo = function() {
      return module.messages;
    }

    module.getConnectedStatus = function() {
      return module.connected
    }

    module.setConnectedStatus = function(status) {
      module.connected = status
    }

    var emit = function(data) {
      if(module.socket == null)
        return;

      var confirm = function(result) {
        if (result.status !== 'ok') {
          return module.options.processError(result);
        }
      }

      module.socket.emit('coach', data, confirm);
    }

    module.selectMessage = function(message_id, selected) {
        emit({
          token: module.options.token(),
          action: '/messages/select',
          args : {
            'message_id': message_id,
            'selected': selected
          }
        })
    }

    module.init = function(options, callback) {
        module.options = options
        module.reconnect(callback)
    }

    module.reconnect = function(callback) {
      module.socket = io.connect(settings.urlCoach());

      module.socket.on('connect', function() {
          // It gives 2 things. We ask server to update coach messages
          // And second, at least one request is required to put client to
          // correct user's room so it will receive notifications
          emit({
            token: module.options.token(),
            action: '/messages/info'
          })

          module.socket.on('disconnect', function(){
            module.options.onDisconnect()
          });

          module.options.onConnect()
      });

      module.socket.on('client', function(result, fn) {
        console.log(result)
        if (result.status !== 'ok') {
          return module.options.processError(result);
        }

        if(result.action == '/messages/info') {
          module.messages = result.data.messages;
          module.options.onMessagesChanged();
        }

        //fn({'result': 'ok'}) // Tell server about it's message
      })
    }

})(message)
