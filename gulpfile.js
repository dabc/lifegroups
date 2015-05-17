var gulp = require('gulp'),
	concat = require('gulp-concat'),
	mbf = require('main-bower-files'),
	less = require('gulp-less'),
    jshint = require('gulp-jshint'),
    karma = require('karma').server,
    nodemon = require('gulp-nodemon'),
    livereload = require('gulp-livereload'),
    handlebars = require('gulp-compile-handlebars'),
    rename = require('gulp-rename'),
    fs = require('fs');

var paths = {
    styles: ['./app/styles/*.less'],
    scripts: ['./app/**/*.js'],
    html: ['./app/**/*.html'],
    images: ['./app/images/**/*.jpg','./app/images/**/*.png'],
    tests: ['./tests/*.js']
};

// vendor
gulp.task('vendor', function () {
    var jsRegex = (/.*\.js$/i),
        cssRegex = (/.*\.css$/i),
        woffRegex = (/.*\.woff$/i),
        woff2Regex = (/.*\.woff2$/i),
        ttfRegex = (/.*\.ttf$/i);

	gulp.src(mbf({ filter: jsRegex }))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/javascripts'));

    gulp.src(mbf({ filter: cssRegex }))
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('public/styles'));

    gulp.src(mbf({ filter: woffRegex }))
        .pipe(gulp.dest('public/styles'));

    gulp.src(mbf({ filter: woff2Regex }))
        .pipe(gulp.dest('public/styles'));

    gulp.src(mbf({ filter: ttfRegex }))
        .pipe(gulp.dest('public/styles'));

    // accommodate bootstrap css source mapping
    gulp.src('./bower_components/**/bootstrap.css.map')
        .pipe(concat('bootstrap.css.map'))
        .pipe(gulp.dest('public/styles'));
});

// app
gulp.task('app', function () {
    gulp.src(paths.scripts)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('html', function () {
	gulp.src(paths.html)
        .pipe(gulp.dest('public'));
});

gulp.task('images', function () {
    gulp.src(paths.images)
        .pipe(gulp.dest('public/images'));
});

// styles
gulp.task('less', function () {
    return gulp.src(paths.styles)
        .pipe(less())
        .pipe(gulp.dest('public/styles'));
});

// code linting
gulp.task('lint', function () {
    return gulp.src(paths.scripts)
        .pipe(jshint(process.env.NODE_ENV === 'development' ? { devel: true, debug: true } : {} ))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

// tests
gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done);
});

gulp.task('compile', function () {
    var templateData = {
            title: 'Lifegroups',
            body: fs.readFileSync('views/index.handlebars', 'utf-8')
        };

    gulp.src('public/**/*')
        .pipe(gulp.dest('dist'));

    return gulp.src('views/layouts/main.handlebars')
        .pipe(handlebars(templateData))
        .pipe(rename('index.html'))
        .pipe(gulp.dest('dist'));
});

// dev server
gulp.task('serve', function (){
    nodemon({
        script: 'app.js',
        env: { 'NODE_ENV': 'development' }
    });
});

// watch files and livereload
gulp.task('watch', function(){
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.scripts, ['lint', 'app']);
    gulp.watch(paths.styles, ['less']);
    livereload.listen();
    gulp.watch('public/**').on('change', livereload.changed);
});

// build
gulp.task('build', ['vendor', 'app', 'html', 'images', 'less', 'lint']);

// deploy
gulp.task('deploy', ['build', 'compile']);

// default gulp task
gulp.task('default', ['build', 'serve', 'watch']);