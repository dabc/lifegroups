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