angular.module('lgApp').controller('homeController', function ($scope, lgService) {
    'use strict';

    $scope.json = '';

    lgService.getLifegroups().then(function (data) {
        $scope.json = data;
    });
});