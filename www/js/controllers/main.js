app.controller('MainCtrl', function($scope, $state, $ionicSideMenuDelegate) {
    $scope.toggleMenu = function() {
        if (!token.exist()) return;

        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.logout = function() {
        token.remove()
        $state.go('login');
        $ionicSideMenuDelegate.toggleLeft(false);
    };
});
