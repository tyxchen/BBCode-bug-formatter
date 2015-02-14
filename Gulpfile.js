/* jshint node: true */

"use strict";

var gulp = require("gulp"),
    rename = require("gulp-rename"),
    autoprefixer = require("gulp-autoprefixer"),
//    csslint = require("gulp-csslint"),
    jshint = require("gulp-jshint");

gulp.task("css", function () {
  return gulp.src("css/main.css")
    .pipe(autoprefixer({browsers: ['last 2 versions', 'IE 9', 'Firefox ESR'], visualCascade: true}))
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest("css/"));
});

gulp.task("js", function () {
  return gulp.src("js/script.js")
    .pipe(jshint())
    .pipe(jshint.reporter("default"))
    .pipe(jshint.reporter("fail"));
});

gulp.task("default", ["css", "js", "watch"]);

gulp.task("watch", function () {
  gulp.watch("css/main.css", ["css"]);
  gulp.watch("js/script.js", ["js"]);
});
