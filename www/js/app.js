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

app.run(function($ionicPlatform, $ionicPopup, $state) {
    document.addEventListener("deviceready", function() {
        window.plugins.insomnia.keepAwake(function() {
            // All is ok
        }, function() {
            notify.error("Can't keep screen on, please dont be upset.");
        });
    }, false);

    if(token.exist()) {
        $state.go('training');
    } else {
        $state.go('login');
    }

    $ionicPlatform.registerBackButtonAction(function(event) {
        $ionicPopup.confirm({
            title: 'System warning',
            template: 'Are you sure you want to exit?'
        }).then(function(res) {
            if (res) {
                ionic.Platform.exitApp();
            }
        });
    }, 100);
});
