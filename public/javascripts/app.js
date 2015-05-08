(function () {
    'use strict';

    var app = angular.module('lgApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute'
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
angular.module('lgApp').controller('homeController', function ($scope) {
    'use strict';

});
angular.module('lgApp').directive('home', function() {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: 'modules/home/homeTemplate.html',
        controller: 'homeController'
    };
});
angular.module('lgApp').controller('lifegroupController', function ($scope) {
    'use strict';

});
angular.module('lgApp').directive('lifegroup', function() {
    'use strict';

    return {
        restrict: 'E',
        templateUrl: 'modules/lifegroup/lifegroupTemplate.html',
        controller: 'lifegroupController'
    };
});