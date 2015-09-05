(function () {
    'use strict';

    angular.module('lgApp').directive('lgNavigation', [function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/navigation/navTemplate.html',
            controller: 'navController'
        };
    }]);
})();
