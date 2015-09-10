(function () {
    'use strict';

    angular.module('lgApp').service('lgService', function ($http, $q) {
        var baseUrl = 'http://daytonave.org/api',
            currLifegroup = {};

        this.getLifegroups = function () {
            var d = $q.defer(),
                lifegroups = [];
            $http.get(baseUrl + '/get_posts/?post_type=page&count=100').success(function (res) {
                var pages = res.posts;
                _.forEach(pages, function (page) {
                    if (page.custom_fields.isLifegroup) {
                        lifegroups.push(page);
                    }
                });
                d.resolve(lifegroups);
            });
            return d.promise;
        };

        this.getLifegroupBySlug = function (slug) {
            var d = $q.defer();
            $http.get(baseUrl + '/get_page/?slug=lifegroups/' + slug).success(function (res) {
                d.resolve(res);
            });
            return d.promise;
        };
    });
})();
