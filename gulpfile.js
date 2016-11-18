const gulp = require('gulp');
const del = require('del');
const typescript = require('gulp-typescript');
const tscConfig = require('./tsconfig.json');

// clean the contents of the distribution directory
gulp.task('cleanTest', function () {
  return del('index.Spec.js');
});

gulp.task('clean', function () {
  return del('index.js');
});

// TypeScript compile
gulp.task('compile', ['cleanTest', 'clean'], function () {
  return gulp
    .src('*.ts')
    .pipe(typescript(tscConfig.compilerOptions))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['compile']);
gulp.task('default', ['build']);