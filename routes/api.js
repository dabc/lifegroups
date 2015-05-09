var express = require('express'),
    request = require('request'),
    router = express.Router(),
    baseUrl = 'http://daytonave.org/api';

router.get('/lifegroups', function (req, res) {
    request.get(baseUrl + '/get_posts/?post_type=page', function (err, response, body) {
        res.json(body);
    });
});

module.exports = router;