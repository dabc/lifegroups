(function () {
    'use strict';

    angular.module('lgApp').service('lgService', function ($http) {
        this.getLifegroups = function () {
            return $http.get('/api/lifegroups');
        };
    });
}());