(function () {
    'use strict';

    var app = angular.module('lgApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ui.grid'
    ]);

    app.config(function($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'homeController',
                templateUrl: 'modules/home/homeTemplate.html'
            })
            .when('/lifegroup', {
                controller: 'lifegroupController',
                templateUrl: 'modules/lifegroup/lifegroupTemplate.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    });
}());