angular.module('lgApp').controller('homeController', function ($scope, $location, lgService, uiGridConstants, lgConfig, localStorage) {
    'use strict';

    var tmpLifegroups = {},
        localLifegroups = localStorage.getItem('lifegroups');

    $scope.lifegroups = [];
    $scope.contentReady = false;

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
        data: [],
        onRegisterApi: function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $location.path('/lifegroup/' + row.entity.slug);
            });
        }
    };

    var formatData = function () {
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
    };

    var getLifegroups = function () {
        lgService.getLifegroups().then(function (lifegroups) {
            $scope.lifegroups = lifegroups;
            var data = {
                timeStamp: moment.utc().toDate(),
                data: lifegroups
            };
            localStorage.setItem('lifegroups', JSON.stringify(data));
            formatData();
            $scope.contentReady = true;
        });
    };

    if (localLifegroups) {
        try {
            tmpLifegroups = JSON.parse(localLifegroups);
            var duration = moment.utc().diff(moment.utc(tmpLifegroups.timeStamp));
            if (moment.duration(duration).asMinutes() > 15) {
                console.log('More than 15 minutes has passed since retrieving data. Retrieve from API instead.');
                localStorage.removeItem('lifegroups');
                getLifegroups();
            } else {
                $scope.lifegroups = tmpLifegroups.data;
                console.log('lifegroups retrieved from local storage');
            }
            formatData();
        } catch (error) {
            console.log('Error parsing lifegroups. Retrieving from API');
            localStorage.removeItem('lifegroups');
            getLifegroups();
        } finally {
            $scope.contentReady = true;
        }
    } else {
        console.log('lifegroups retrieved from API');
        getLifegroups();
    }
});
