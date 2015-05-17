angular.module('lgApp').service('lgService', function ($http) {
    'use strict';

    var baseUrl = 'http://daytonave.org/api',
        currLifegroup = {};

    this.getLifegroups = function () {
        var lifegroups = {
                home: {},
                groups: []
            };
        return $http.get(baseUrl + '/get_posts/?post_type=page').then(function (res) {
            var pages = res.data;
            _.forEach(pages.posts, function (page) {
                if (page.custom_fields.isLifegroup) {
                    lifegroups.groups.push(page);
                }
                if (page.custom_fields.lgIsHome) {
                    lifegroups.home = page;
                }
            });
            return lifegroups;
        });
    };

    this.getLifegroupBySlug = function (slug) {
        return $http.get(baseUrl + '/get_page/?slug=lifegroups/' + slug);
    };
});