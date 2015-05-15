(function () {
    'use strict';

    angular.module('lgApp').service('lgService', function ($http) {
        this.getLifegroups = function () {
            var d = $.Deferred(),
                lifegroups = {
                    home: {},
                    groups: []
                };
            $http.get('/api/lifegroups').then(function (res) {
                var pages = JSON.parse(res.data);
                _.forEach(pages.posts, function (page) {
                    if (page.custom_fields.isLifegroup) {
                        lifegroups.groups.push(page);
                    }
                    if (page.custom_fields.lgIsHome) {
                        lifegroups.home = page;
                    }
                });
                d.resolve(lifegroups);
            });
            return d.promise();
        };
    });
}());