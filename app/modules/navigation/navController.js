(function () {
    'use strict';

    angular.module('lgApp').controller('navController', ['$scope', '$location', function($scope, $location) {
        $scope.goto = function(loc) {
            $location.path(loc);
        };
    }]);
})();
