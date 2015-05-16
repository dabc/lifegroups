angular.module('lgApp').service('lgService', function ($http) {
    'use strict';

    var currLifegroup = {};

    this.getLifegroups = function () {
        var lifegroups = {
                home: {},
                groups: []
            };
        return $http.get('/api/lifegroups').then(function (res) {
            var pages = JSON.parse(res.data);
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
        return $http.get('/api/lifegroup/' + slug);
    };
});