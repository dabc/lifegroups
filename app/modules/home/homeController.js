angular.module('lgApp').controller('homeController', function ($scope, lgService, uiGridConstants) {
    'use strict';

    $scope.gridOptions = {};
    $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.data = [];
    $scope.lifegroups = [];
    $scope.content = '';

    lgService.getLifegroups().then(function (lifegroups) {
        $scope.lifegroups = lifegroups.groups;
        _.forEach($scope.lifegroups, function (group) {
            $scope.gridOptions.data.push({
                title: group.title,
                ages: group.custom_fields.lgAges[0],
                day: group.custom_fields.lgDay[0],
                leader: group.custom_fields.lgLeader[0],
                location: group.custom_fields.lgLocation[0],
                type: group.custom_fields.lgType[0]
            });
        });
        $scope.content = lifegroups.home.content;

    });
});