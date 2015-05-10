angular.module('lgApp').directive('lgNavigation', function () {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: 'modules/navigation/navTemplate.html',
        controller: 'navController'
    };
});