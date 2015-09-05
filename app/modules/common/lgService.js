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
