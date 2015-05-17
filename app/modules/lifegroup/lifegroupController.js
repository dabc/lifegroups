angular.module('lgApp').controller('lifegroupController', function ($scope, $routeParams, $location, lgService) {
    'use strict';

    $scope.lifegroup = {};
    $scope.contentReady = false;

    lgService.getLifegroupBySlug($routeParams.slug).then(function (lifegroup) {
        $scope.lifegroup = lifegroup.data.page;
        $scope.contentReady = true;
    });

    $scope.navigateHome = function () {
        $location.path('/');
    };
});