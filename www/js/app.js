var app = angular.module('Ztd.Blunders Mobile', ['ionic']);

app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    });

    $stateProvider.state('training', {
        url: '/training',
        templateUrl: 'training.html',
        controller: 'TrainingCtrl'
    });

    $urlRouterProvider.otherwise('/login');
});

app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    $scope.login = function() {
        $state.go('training');
    };
});

app.controller('TrainingCtrl', function($scope, $state) {
});
