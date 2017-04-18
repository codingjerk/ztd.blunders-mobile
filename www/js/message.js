"use strict";

var message = {};

(function(module) {
    module.options = null
    module.messages = []

    module.socket = io.connect(settings.urlCoach());

    module.coachMessagesInfo = function() {
      return module.messages;
    }

    var emit = function(data) {
      var confirm = function(result) {
        if (result.status !== 'ok') {
          return $scope.processError(result);
        }
      }

      module.socket.emit('coach', data, confirm);
    }

    module.socket.on('connect', function() {
        // It gives 2 things. We ask server to update coach messages
        // And second, at least one request is required to put client to
        // correct user's room so it will receive notifications
        emit({
          token: module.options.token(),
          action: '/messages/info'
        })
    });

    module.socket.on('client', function(result, fn) {
      console.log(result)
      if (result.status !== 'ok') {
        return $scope.processError(result);
      }

      if(result.action == '/messages/info') {
        module.messages = result.data.messages;
        module.options.onMessagesChanged();
      }

      //fn({'result': 'ok'}) // Tell server about it's message
    })

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

    module.init = function(options) {
        module.options = options
    }

})(message)
