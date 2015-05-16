angular.module('lgApp').directive('lifegroup', function() {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: 'modules/lifegroup/lifegroupTemplate.html',
        controller: 'lifegroupController',
        scope: {}
    };
});