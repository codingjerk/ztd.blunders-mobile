"use strict";

var notify = {
    error: function(text) {
        toastr.options = {
            "positionClass": "toast-bottom-center",
            "preventDuplicates": true,
            "timeOut": "2000",

        };
        toastr["error"](text, "Error");
    },
    good: function(text) {
        toastr.options = {
            "positionClass": "toast-bottom-center",
            "preventDuplicates": true,
            "timeOut": "2000",

        };
        toastr["success"](text);
    }

};
