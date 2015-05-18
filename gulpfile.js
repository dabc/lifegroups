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
    fs = require('fs'),
    del = require('del');

var paths = {
    styles: ['./app/styles/*.less'],
    scripts: ['./app/**/*.js'],
    html: ['./app/**/*.html'],
    uigrid: ['./bower_components/angular-ui-grid/*.woff','./bower_components/angular-ui-grid/*.ttf','./bower_components/angular-ui-grid/*.svg','./bower_components/angular-ui-grid/*.eot'],
    fontawesome: ['./bower_components/fontawesome/fonts/**'],
    tests: ['./tests/*.js']
};

gulp.task('clean', function (cb) {
    // You can use multiple globbing patterns as you would with `gulp.src`
    del(['public/**/*','dist/**/*'], cb);
});

// vendor
gulp.task('vendor', function () {
    var jsRegex = (/.*\.js$/i);

	return gulp.src(mbf({ filter: jsRegex }))
        .pipe(concat('vendor.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('bsmap', function () {
    // accommodate bootstrap css source mapping
    return gulp.src('./bower_components/**/bootstrap.css.map')
        .pipe(concat('bootstrap.css.map'))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('styles', function () {
    var cssRegex = (/.*\.css$/i);

    return gulp.src(mbf({ filter: cssRegex }))
        .pipe(concat('vendor.css'))
        .pipe(gulp.dest('public/styles'));
});

gulp.task('fonts:uigrid', function () {
    return gulp.src(paths.uigrid)
        .pipe(gulp.dest('public/styles'));
});

gulp.task('fonts:fontawesome', function () {
    return gulp.src(paths.fontawesome)
        .pipe(gulp.dest('public/fonts'));
});

// app
gulp.task('app', function () {
    return gulp.src(paths.scripts)
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/javascripts'));
});

gulp.task('html', function () {
	return gulp.src(paths.html)
        .pipe(gulp.dest('public'));
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

// dev server
gulp.task('serve', function () {
    nodemon({
        script: 'app.js',
        env: { 'NODE_ENV': 'development' }
    });
});

// watch files and livereload
gulp.task('watch', function () {
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.scripts, ['lint', 'app']);
    gulp.watch(paths.styles, ['less']);
    livereload.listen();
    gulp.watch('public/**').on('change', livereload.changed);
});

// build
gulp.task('build', ['vendor', 'styles', 'bsmap', 'fonts:uigrid', 'fonts:fontawesome', 'app', 'html', 'less', 'lint']);

// deploy
gulp.task('deploy', ['build'], function () {
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

// default gulp task
gulp.task('default', ['build', 'serve', 'watch']);