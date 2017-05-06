var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');

var browserSync = require('browser-sync');
var reload = browserSync.reload;
var historyApiFallback = require('connect-history-api-fallback')


/*
  Styles
*/
gulp.task('styles',function() {
  gulp.src('scss/**/*.scss')
    .pipe(sass({
      style: 'compress'
    }))
    .pipe(autoprefixer({ browsers: ['last 2 version', '> 5%'] }))
    .pipe(gulp.dest('./css/'))
    .pipe(reload({stream:true}))
});

/*
  Images
*/
gulp.task('images',function(){
  gulp.src('img/**')
    .pipe(imagemin())
    .pipe(gulp.dest('./img'))
});

/*
  Browser Sync
*/
gulp.task('browser-sync', function() {
    browserSync({
        server : {},
        middleware : [ historyApiFallback() ],
        ghostMode: false
    });
});

/*
  Watch for future changes
*/
gulp.task('default', ['images','styles','browser-sync'], function() {
  gulp.watch('scss/**/*.scss', ['styles']);
});