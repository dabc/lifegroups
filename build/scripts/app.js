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

(function () {
    'use strict';
    
    angular.module('lgApp').constant('lgConfig', {
        // min and max must match lgAgeMin and lgAgeMax values in Wordpress exactly
        agesArr: [
            {
                min: 0,
                max: 100,
                title: 'All Ages'
            },
            {
                min: 20,
                max: 39,
                title: '20s/30s'
            }
        ]
    });
})();

(function () {
    'use strict';
    
    angular.module('lgApp').service('lgService', function ($http) {
        var baseUrl = 'http://daytonave.org/api',
            currLifegroup = {};

        this.getLifegroups = function () {
            var lifegroups = [];
            return $http.get(baseUrl + '/get_posts/?post_type=page').then(function (res) {
                var pages = res.data;
                _.forEach(pages.posts, function (page) {
                    if (page.custom_fields.isLifegroup) {
                        lifegroups.push(page);
                    }
                });
                return lifegroups;
            });
        };

        this.getLifegroupBySlug = function (slug) {
            return $http.get(baseUrl + '/get_page/?slug=lifegroups/' + slug);
        };
    });
})();

(function () {
    'use strict';

    angular.module('lgApp').controller('homeController', function ($scope, $location, lgService, uiGridConstants, lgConfig, localStorage, moment) {
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
})();

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

(function () {
    'use strict';

    angular.module('lgApp').controller('navController', function($scope, $location) {
        $scope.goto = function(loc) {
            $location.path(loc);
        };
    });
})();

(function () {
    'use strict';

    angular.module('lgApp').directive('lgNavigation', function () {
        return {
            restrict: 'E',
            templateUrl: 'modules/navigation/navTemplate.html',
            controller: 'navController'
        };
    });
})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImxnQ29uZmlnLmpzIiwiY29tbW9uL2xnU2VydmljZS5qcyIsImhvbWUvaG9tZUNvbnRyb2xsZXIuanMiLCJsaWZlZ3JvdXAvbGlmZWdyb3VwQ29udHJvbGxlci5qcyIsIm5hdmlnYXRpb24vbmF2Q29udHJvbGxlci5qcyIsIm5hdmlnYXRpb24vbmF2RGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2xnQXBwJywgW1xyXG4gICAgICAgICduZ0Nvb2tpZXMnLFxyXG4gICAgICAgICduZ1Jlc291cmNlJyxcclxuICAgICAgICAnbmdTYW5pdGl6ZScsXHJcbiAgICAgICAgJ25nUm91dGUnLFxyXG4gICAgICAgICd1aS5ncmlkJyxcclxuICAgICAgICAndWkuZ3JpZC5zZWxlY3Rpb24nXHJcbiAgICBdKTtcclxuXHJcbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uICgkcm91dGVQcm92aWRlcikge1xyXG4gICAgICAgICRyb3V0ZVByb3ZpZGVyXHJcbiAgICAgICAgICAgIC53aGVuKCcvJywge1xyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ2hvbWVDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kdWxlcy9ob21lL2hvbWVUZW1wbGF0ZS5odG1sJ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAud2hlbignL2xpZmVncm91cC86c2x1ZycsIHtcclxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdsaWZlZ3JvdXBDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnbW9kdWxlcy9saWZlZ3JvdXAvbGlmZWdyb3VwVGVtcGxhdGUuaHRtbCdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm90aGVyd2lzZSh7XHJcbiAgICAgICAgICAgICAgICByZWRpcmVjdFRvOiAnLydcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KVxyXG4gICAgLnZhbHVlKCdsb2NhbFN0b3JhZ2UnLCB3aW5kb3cubG9jYWxTdG9yYWdlKVxyXG4gICAgLnZhbHVlKCdtb21lbnQnLCB3aW5kb3cubW9tZW50KVxyXG4gICAgLnZhbHVlKCdfJywgd2luZG93Ll8pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnbGdBcHAnKS5jb25zdGFudCgnbGdDb25maWcnLCB7XHJcbiAgICAgICAgLy8gbWluIGFuZCBtYXggbXVzdCBtYXRjaCBsZ0FnZU1pbiBhbmQgbGdBZ2VNYXggdmFsdWVzIGluIFdvcmRwcmVzcyBleGFjdGx5XHJcbiAgICAgICAgYWdlc0FycjogW1xyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBtaW46IDAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDEwMCxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQWxsIEFnZXMnXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG1pbjogMjAsXHJcbiAgICAgICAgICAgICAgICBtYXg6IDM5LFxyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICcyMHMvMzBzJ1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICBcclxuICAgIGFuZ3VsYXIubW9kdWxlKCdsZ0FwcCcpLnNlcnZpY2UoJ2xnU2VydmljZScsIGZ1bmN0aW9uICgkaHR0cCkge1xyXG4gICAgICAgIHZhciBiYXNlVXJsID0gJ2h0dHA6Ly9kYXl0b25hdmUub3JnL2FwaScsXHJcbiAgICAgICAgICAgIGN1cnJMaWZlZ3JvdXAgPSB7fTtcclxuXHJcbiAgICAgICAgdGhpcy5nZXRMaWZlZ3JvdXBzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgbGlmZWdyb3VwcyA9IFtdO1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGJhc2VVcmwgKyAnL2dldF9wb3N0cy8/cG9zdF90eXBlPXBhZ2UnKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBwYWdlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgXy5mb3JFYWNoKHBhZ2VzLnBvc3RzLCBmdW5jdGlvbiAocGFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlLmN1c3RvbV9maWVsZHMuaXNMaWZlZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlmZWdyb3Vwcy5wdXNoKHBhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGxpZmVncm91cHM7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRoaXMuZ2V0TGlmZWdyb3VwQnlTbHVnID0gZnVuY3Rpb24gKHNsdWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChiYXNlVXJsICsgJy9nZXRfcGFnZS8/c2x1Zz1saWZlZ3JvdXBzLycgKyBzbHVnKTtcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcbn0pKCk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2xnQXBwJykuY29udHJvbGxlcignaG9tZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYXRpb24sIGxnU2VydmljZSwgdWlHcmlkQ29uc3RhbnRzLCBsZ0NvbmZpZywgbG9jYWxTdG9yYWdlLCBtb21lbnQpIHtcclxuICAgICAgICB2YXIgdG1wTGlmZWdyb3VwcyA9IHt9LFxyXG4gICAgICAgICAgICBsb2NhbExpZmVncm91cHMgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbGlmZWdyb3VwcycpO1xyXG5cclxuICAgICAgICAkc2NvcGUubGlmZWdyb3VwcyA9IFtdO1xyXG4gICAgICAgICRzY29wZS5jb250ZW50UmVhZHkgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgJHNjb3BlLmdyaWRPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBlbmFibGVSb3dTZWxlY3Rpb246IHRydWUsXHJcbiAgICAgICAgICAgIGVuYWJsZVJvd0hlYWRlclNlbGVjdGlvbjogZmFsc2UsXHJcbiAgICAgICAgICAgIGVuYWJsZUhvcml6b250YWxTY3JvbGxiYXI6IHVpR3JpZENvbnN0YW50cy5zY3JvbGxiYXJzLk5FVkVSLFxyXG4gICAgICAgICAgICBlbmFibGVWZXJ0aWNhbFNjcm9sbGJhcjogdWlHcmlkQ29uc3RhbnRzLnNjcm9sbGJhcnMuTkVWRVIsXHJcbiAgICAgICAgICAgIG11bHRpU2VsZWN0OiBmYWxzZSxcclxuICAgICAgICAgICAgLy9lbmFibGVGaWx0ZXJpbmc6IHRydWUsXHJcbiAgICAgICAgICAgIGNvbHVtbkRlZnM6IFtcclxuICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd0aXRsZScsIGVuYWJsZUZpbHRlcmluZzogZmFsc2UgfSxcclxuICAgICAgICAgICAgICAgIHsgZmllbGQ6ICdhZ2VzJywgZW5hYmxlRmlsdGVyaW5nOiBmYWxzZSB9LFxyXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2RheScsIGVuYWJsZUZpbHRlcmluZzogZmFsc2UgfSxcclxuICAgICAgICAgICAgICAgIHsgZmllbGQ6ICd0aW1lJywgZW5hYmxlRmlsdGVyaW5nOiBmYWxzZSB9LFxyXG4gICAgICAgICAgICAgICAgeyBmaWVsZDogJ2NhbXB1cycsIGVuYWJsZUZpbHRlcmluZzogZmFsc2UgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkYXRhOiBbXSxcclxuICAgICAgICAgICAgb25SZWdpc3RlckFwaTogZnVuY3Rpb24gKGdyaWRBcGkpIHtcclxuICAgICAgICAgICAgICAgIC8vc2V0IGdyaWRBcGkgb24gc2NvcGVcclxuICAgICAgICAgICAgICAgICRzY29wZS5ncmlkQXBpID0gZ3JpZEFwaTtcclxuICAgICAgICAgICAgICAgIGdyaWRBcGkuc2VsZWN0aW9uLm9uLnJvd1NlbGVjdGlvbkNoYW5nZWQoJHNjb3BlLCBmdW5jdGlvbiAocm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9saWZlZ3JvdXAvJyArIHJvdy5lbnRpdHkuc2x1Zyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBmb3JtYXREYXRhID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBfLmZvckVhY2goJHNjb3BlLmxpZmVncm91cHMsIGZ1bmN0aW9uIChncm91cCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGFnZXMgPSBfLnJlc3VsdChfLmZpbmQobGdDb25maWcuYWdlc0FyciwgeyAnbWluJzogcGFyc2VJbnQoZ3JvdXAuY3VzdG9tX2ZpZWxkcy5sZ0FnZU1pbiksICdtYXgnOiBwYXJzZUludChncm91cC5jdXN0b21fZmllbGRzLmxnQWdlTWF4KSB9KSwgJ3RpdGxlJyksXHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVN0ciA9IGdyb3VwLmN1c3RvbV9maWVsZHMubGdTdGFydFRpbWVbMF0uc3BsaXQoJzonKVswXS5sZW5ndGggPiAxID8gJzE5NzAtMDEtMDFUJyArIGdyb3VwLmN1c3RvbV9maWVsZHMubGdTdGFydFRpbWVbMF0gOiAnMTk3MC0wMS0wMVQwJyArIGdyb3VwLmN1c3RvbV9maWVsZHMubGdTdGFydFRpbWVbMF07XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZ3JpZE9wdGlvbnMuZGF0YS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZ3JvdXAuaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6IGdyb3VwLnRpdGxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFnZXM6IGFnZXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZGF5OiBncm91cC5jdXN0b21fZmllbGRzLmxnRGF5WzBdLFxyXG4gICAgICAgICAgICAgICAgICAgIHRpbWU6IG1vbWVudC51dGModGltZVN0cikuZm9ybWF0KCdoOm1tYScpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNhbXB1czogZ3JvdXAuY3VzdG9tX2ZpZWxkcy5sZ0lzT2ZmQ2FtcHVzWzBdID09PSAndHJ1ZScgPyAnT2ZmIENhbXB1cycgOiAnT24gQ2FtcHVzJyxcclxuICAgICAgICAgICAgICAgICAgICBzbHVnOiBncm91cC5zbHVnXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGdldExpZmVncm91cHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxnU2VydmljZS5nZXRMaWZlZ3JvdXBzKCkudGhlbihmdW5jdGlvbiAobGlmZWdyb3Vwcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxpZmVncm91cHMgPSBsaWZlZ3JvdXBzO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGltZVN0YW1wOiBtb21lbnQudXRjKCkudG9EYXRlKCksXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogbGlmZWdyb3Vwc1xyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdsaWZlZ3JvdXBzJywgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0RGF0YSgpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnRSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChsb2NhbExpZmVncm91cHMpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRtcExpZmVncm91cHMgPSBKU09OLnBhcnNlKGxvY2FsTGlmZWdyb3Vwcyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHVyYXRpb24gPSBtb21lbnQudXRjKCkuZGlmZihtb21lbnQudXRjKHRtcExpZmVncm91cHMudGltZVN0YW1wKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobW9tZW50LmR1cmF0aW9uKGR1cmF0aW9uKS5hc01pbnV0ZXMoKSA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vcmUgdGhhbiAxNSBtaW51dGVzIGhhcyBwYXNzZWQgc2luY2UgcmV0cmlldmluZyBkYXRhLiBSZXRyaWV2ZSBmcm9tIEFQSSBpbnN0ZWFkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdsaWZlZ3JvdXBzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0TGlmZWdyb3VwcygpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubGlmZWdyb3VwcyA9IHRtcExpZmVncm91cHMuZGF0YTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbGlmZWdyb3VwcyByZXRyaWV2ZWQgZnJvbSBsb2NhbCBzdG9yYWdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3JtYXREYXRhKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcGFyc2luZyBsaWZlZ3JvdXBzLiBSZXRyaWV2aW5nIGZyb20gQVBJJyk7XHJcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnbGlmZWdyb3VwcycpO1xyXG4gICAgICAgICAgICAgICAgZ2V0TGlmZWdyb3VwcygpO1xyXG4gICAgICAgICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvbnRlbnRSZWFkeSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbGlmZWdyb3VwcyByZXRyaWV2ZWQgZnJvbSBBUEknKTtcclxuICAgICAgICAgICAgZ2V0TGlmZWdyb3VwcygpO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG59KSgpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdsZ0FwcCcpLmNvbnRyb2xsZXIoJ2xpZmVncm91cENvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbiwgbGdTZXJ2aWNlKSB7XHJcbiAgICAgICAgdmFyIHRtcExpZmVncm91cCA9IHt9LFxyXG4gICAgICAgICAgICBsb2NhbExpZmVncm91cCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgkcm91dGVQYXJhbXMuc2x1Zyk7XHJcblxyXG4gICAgICAgICRzY29wZS5saWZlZ3JvdXAgPSB7fTtcclxuICAgICAgICAkc2NvcGUuY29udGVudFJlYWR5ID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHZhciBnZXRMaWZlZ3JvdXAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxnU2VydmljZS5nZXRMaWZlZ3JvdXBCeVNsdWcoJHJvdXRlUGFyYW1zLnNsdWcpLnRoZW4oZnVuY3Rpb24gKGxpZmVncm91cCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxpZmVncm91cCA9IGxpZmVncm91cC5kYXRhLnBhZ2U7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB0aW1lU3RhbXA6IG1vbWVudC51dGMoKS50b0RhdGUoKSxcclxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBsaWZlZ3JvdXBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJHJvdXRlUGFyYW1zLnNsdWcsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50UmVhZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAobG9jYWxMaWZlZ3JvdXApIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHRtcExpZmVncm91cCA9IEpTT04ucGFyc2UobG9jYWxMaWZlZ3JvdXApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGR1cmF0aW9uID0gbW9tZW50LnV0YygpLmRpZmYobW9tZW50LnV0Yyh0bXBMaWZlZ3JvdXAudGltZVN0YW1wKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobW9tZW50LmR1cmF0aW9uKGR1cmF0aW9uKS5hc01pbnV0ZXMoKSA+IDE1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ01vcmUgdGhhbiAxNSBtaW51dGVzIGhhcyBwYXNzZWQgc2luY2UgcmV0cmlldmluZyBkYXRhLiBSZXRyaWV2ZSBmcm9tIEFQSSBpbnN0ZWFkLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgkcm91dGVQYXJhbXMuc2x1Zyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2V0TGlmZWdyb3VwKCk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5saWZlZ3JvdXAgPSB0bXBMaWZlZ3JvdXAuZGF0YS5kYXRhLnBhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2xpZmVncm91cCByZXRyaWV2ZWQgZnJvbSBsb2NhbCBzdG9yYWdlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgcGFyc2luZyBsaWZlZ3JvdXAuIFJldHJpZXZpbmcgZnJvbSBBUEknKTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgkcm91dGVQYXJhbXMuc2x1Zyk7XHJcbiAgICAgICAgICAgICAgICBnZXRMaWZlZ3JvdXAoKTtcclxuICAgICAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5jb250ZW50UmVhZHkgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2xpZmVncm91cCByZXRyaWV2ZWQgZnJvbSBBUEknKTtcclxuICAgICAgICAgICAgZ2V0TGlmZWdyb3VwKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUubmF2aWdhdGVIb21lID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnbGdBcHAnKS5jb250cm9sbGVyKCduYXZDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24pIHtcclxuICAgICAgICAkc2NvcGUuZ290byA9IGZ1bmN0aW9uKGxvYykge1xyXG4gICAgICAgICAgICAkbG9jYXRpb24ucGF0aChsb2MpO1xyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxufSkoKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnbGdBcHAnKS5kaXJlY3RpdmUoJ2xnTmF2aWdhdGlvbicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ21vZHVsZXMvbmF2aWdhdGlvbi9uYXZUZW1wbGF0ZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ25hdkNvbnRyb2xsZXInXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG59KSgpO1xyXG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=