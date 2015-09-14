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

app.controller('MainCtrl', function($scope, $state, $ionicSideMenuDelegate) {
    $scope.isTokenExist = function() {
        return localStorage.getItem('api-token') !== null;
    };

    $scope.showMenu = function() {
        if (!$scope.isTokenExist()) return;

        $ionicSideMenuDelegate.toggleLeft();
    };
});

app.controller('LoginCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    $scope.login = function() {
        $state.go('training');
    };

    $scope.goToSignup = function() {
        $ionicSlideBoxDelegate.next();
    };
});

app.controller('TrainingCtrl', function($scope, $state) {
    $scope.whitePlayer = 'Kasparov M. I.';
    $scope.blackPlayer = 'Kasparov M. I.';

    $scope.value = 1000;

    $scope.$on('$ionicView.loaded', function() {
        new Chessboard('board', ChessUtils.FEN.initial);
    });
});
