angular.module('lgApp').controller('navController', function($scope, $location, $window) {
    'use strict';

    $scope.goto = function(loc) {
        $location.path(loc);
    };
});