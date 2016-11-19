"use strict";

var token = {};

(function(module) {
  module.get = function() {
    var result = localStorage.getItem('api-token');

    return result
  }

  module.set = function(token) {
    localStorage.setItem('api-token', token);
  }

  module.exist = function() {
    return localStorage.getItem('api-token') !== null;
  }

  module.remove = function() {
    localStorage.removeItem('api-token');
  }

})(token)
