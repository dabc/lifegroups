angular.module('lgApp').controller('homeController', function ($scope, lgService, uiGridConstants, lgConfig) {
    'use strict';

    $scope.gridOptions = {};
    $scope.gridOptions.enableHorizontalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.enableVerticalScrollbar = uiGridConstants.scrollbars.NEVER;
    $scope.gridOptions.data = [];
    $scope.lifegroups = [];
    $scope.content = '';
    $scope.contentReady = false;

    lgService.getLifegroups().then(function (lifegroups) {
        $scope.lifegroups = lifegroups.groups;
        _.forEach($scope.lifegroups, function (group) {
            var ages = _.result(_.find(lgConfig.agesArr, { 'min': parseInt(group.custom_fields.lgAgeMin), 'max': parseInt(group.custom_fields.lgAgeMax) }), 'title'),
                timeStr = group.custom_fields.lgStartTime[0].split(':')[0].length > 1 ? '1970-01-01T' + group.custom_fields.lgStartTime[0] : '1970-01-01T0' + group.custom_fields.lgStartTime[0];
            $scope.gridOptions.data.push({
                title: group.title,
                ages: ages,
                day: group.custom_fields.lgDay[0],
                time: moment.utc(timeStr).format('h:mma'),
                campus: group.custom_fields.lgIsOffCampus[0] === 'true' ? 'Off Campus' : 'On Campus'
            });
        });
        $scope.content = lifegroups.home.content;
        $scope.contentReady = true;
    });
});