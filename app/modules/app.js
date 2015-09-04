(function () {
    'use strict';

    var app = angular.module('lgApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ui.grid',
        'ui.grid.selection'
    ]);

    app.config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'homeController',
                templateUrl: 'modules/home/homeTemplate.html'
            })
            .when('/lifegroup/:slug', {
                controller: 'lifegroupController',
                templateUrl: 'modules/lifegroup/lifegroupTemplate.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .value('localStorage', window.localStorage)
    .value('moment', window.moment)
    .value('_', window._);
})();
