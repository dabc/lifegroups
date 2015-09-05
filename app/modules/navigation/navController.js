(function () {
    'use strict';

    angular.module('lgApp').controller('navController', function ($scope, $location) {
        $scope.goto = function(loc) {
            $location.path(loc);
        };
    });
})();
