var express = require('express'),
    request = require('request'),
    router = express.Router(),
    baseUrl = 'http://daytonave.org/api';

router.get('/lifegroups', function (req, res) {
    request.get(baseUrl + '/get_posts/?post_type=page', function (err, response, body) {
        res.json(body);
    });
});

router.get('/lifegroup/:slug', function (req, res) {
    request.get(baseUrl + '/get_page/?slug=lifegroups/' + req.params.slug, function (err, response, body) {
        console.log(body);
        res.json(body);
    });
});

module.exports = router;