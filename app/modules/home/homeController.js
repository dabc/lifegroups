angular.module('lgApp').controller('homeController', function ($scope, $location, lgService, uiGridConstants, lgConfig) {
    'use strict';

    $scope.gridOptions = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
        enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
        multiSelect: false,
        //enableFiltering: true,
        columnDefs: [
            { field: 'title', enableFiltering: false },
            { field: 'ages', enableFiltering: false },
            { field: 'day', enableFiltering: false },
            { field: 'time', enableFiltering: false },
            { field: 'campus', enableFiltering: false }
        ],
        data: []
    };

    $scope.lifegroups = [];
    $scope.content = '';
    $scope.contentReady = false;

    lgService.getLifegroups().then(function (lifegroups) {
        $scope.lifegroups = lifegroups.groups;
        _.forEach($scope.lifegroups, function (group) {
            var ages = _.result(_.find(lgConfig.agesArr, { 'min': parseInt(group.custom_fields.lgAgeMin), 'max': parseInt(group.custom_fields.lgAgeMax) }), 'title'),
                timeStr = group.custom_fields.lgStartTime[0].split(':')[0].length > 1 ? '1970-01-01T' + group.custom_fields.lgStartTime[0] : '1970-01-01T0' + group.custom_fields.lgStartTime[0];
            $scope.gridOptions.data.push({
                id: group.id,
                title: group.title,
                ages: ages,
                day: group.custom_fields.lgDay[0],
                time: moment.utc(timeStr).format('h:mma'),
                campus: group.custom_fields.lgIsOffCampus[0] === 'true' ? 'Off Campus' : 'On Campus',
                slug: group.slug
            });
        });
        $scope.content = lifegroups.home.content;
        $scope.contentReady = true;
    });

    $scope.gridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            $location.path('/lifegroup/' + row.entity.slug);
        });
    };

    $scope.$watch('contentReady', function (value) {
        if (value)
            $('.lg-grid-container').css({'visibility': 'visible'});
    });
});