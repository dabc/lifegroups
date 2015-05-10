angular.module('lgApp').controller('homeController', function ($scope, lgService) {
    'use strict';

    $scope.lifegroups = [];
    $scope.content = '';

    lgService.getLifegroups().then(function (lifegroups) {
        $scope.lifegroups = lifegroups.groups;
        $scope.content = lifegroups.home.content;

    });
});