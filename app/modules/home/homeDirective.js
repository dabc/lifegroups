angular.module('lgApp').directive('home', function() {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: 'modules/home/homeTemplate.html',
        controller: 'homeController',
        scope: {}
    };
});