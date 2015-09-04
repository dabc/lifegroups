(function () {
    'use strict';

    angular.module('lgApp').controller('lifegroupController', function ($scope, $routeParams, $location, lgService) {
        var tmpLifegroup = {},
            localLifegroup = window.localStorage.getItem($routeParams.slug);

        $scope.lifegroup = {};
        $scope.contentReady = false;

        var getLifegroup = function () {
            lgService.getLifegroupBySlug($routeParams.slug).then(function (lifegroup) {
                $scope.lifegroup = lifegroup.data.page;
                var data = {
                    timeStamp: moment.utc().toDate(),
                    data: lifegroup
                };
                window.localStorage.setItem($routeParams.slug, JSON.stringify(data));
                $scope.contentReady = true;
            });
        };

        if (localLifegroup) {
            try {
                tmpLifegroup = JSON.parse(localLifegroup);
                var duration = moment.utc().diff(moment.utc(tmpLifegroup.timeStamp));
                if (moment.duration(duration).asMinutes() > 15) {
                    console.log('More than 15 minutes has passed since retrieving data. Retrieve from API instead.');
                    window.localStorage.removeItem($routeParams.slug);
                    getLifegroup();
                } else {
                    $scope.lifegroup = tmpLifegroup.data.data.page;
                    console.log('lifegroup retrieved from local storage');
                }
            } catch (error) {
                console.log('Error parsing lifegroup. Retrieving from API');
                window.localStorage.removeItem($routeParams.slug);
                getLifegroup();
            } finally {
                $scope.contentReady = true;
            }
        } else {
            console.log('lifegroup retrieved from API');
            getLifegroup();
        }

        $scope.navigateHome = function () {
            $location.path('/');
        };
    });
})();
