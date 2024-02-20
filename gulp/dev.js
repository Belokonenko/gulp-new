const gulp = require("gulp");
const fileinclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require('gulp-sass-glob');
const browserSync = require("browser-sync").create();
const clean = require("gulp-clean");
const fs = require("fs");
const sourceMaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const imagemin = require("gulp-imagemin");
const changed = require("gulp-changed");


const webp = require("gulp-webp") ;

gulp.task("html:dev", function () {
    return gulp
        .src(["./src/html/**/*.html", "!./src/html/blocks/*.html"])

        .pipe(changed("./build/",{hasChanged: changed.compareContents}))
        .pipe(
            plumber({
                errorHandler: notify.onError({
                    title: "HTML",
                    message: "Error <%= error.message %>",
                    sound: false,
                }),
            })
        )
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "@file",
            })
        )
        // .pipe(webpHTML())
        .pipe(gulp.dest("./build/"));
});

gulp.task("sass:dev", function () {
    return gulp
        .src("./src/scss/*.scss")
        .pipe(changed("./build/css/"))
        
        .pipe(
            plumber({
                errorHandler: notify.onError({
                    title: "SCSS",
                    message: "Error <%= error.message %>",
                    sound: false,
                }),
            })
        )
        
        .pipe(sourceMaps.init())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest("./build/css/"));
});

gulp.task("images:dev", function () {
    return gulp.src("./src/img/**.*")
        .pipe(changed("./build/img/"))
        
        
        // .pipe(gulp.src("./src/img/**.*"))
        .pipe(imagemin({verbose: true}))
        .pipe(gulp.dest("./build/img/"))
        .pipe(webp())
        .pipe(gulp.dest("./build/img/"))
    ;
});

// gulp.task("images:dev", function () {
//     return gulp.src("./src/img/**.*")
//         .pipe(changed("./build/img/"))
//         .pipe(imagemin({verbose: true}))
//         .pipe(gulp.dest("./build/img/"));
// });

gulp.task("fonts:dev", function () {
    return gulp.src("./src/fonts/**.*")
        .pipe(changed("./build/fonts/"))
        .pipe(gulp.dest("./build/fonts/"));
});

gulp.task("files:dev", function () {
    return gulp.src("./src/files/**.*")
        .pipe(changed("./build/files/"))
        .pipe(gulp.dest("./build/files/"));
});

gulp.task("server:dev", function () {
    browserSync.init({
        server: {
            baseDir: "./build",
        },
    });
    browserSync.watch("build", browserSync.reload);
});

gulp.task("clean:dev", function (cb) {
    if (fs.existsSync("./build/")) {
        return gulp
            .src("./build/", { read: false })
            .pipe(clean({ force: true }));
    } else {
        cb();
    }
});

gulp.task("js:dev", function () {
    return gulp
        .src("./src/js/*.js")
        .pipe(changed("build/js"))
        .pipe(
            plumber({
                errorHandler: notify.onError({
                    title: "JS",
                    message: "Error <%= error.message %>",
                    sound: false,
                }),
            })
        )
        .pipe(babel())
        .pipe(webpack(require("./../webpack.config.js")))
        .pipe(gulp.dest("build/js"));
});

gulp.task("watch:dev", function () {
    gulp.watch("./src/**/*.scss", gulp.parallel("sass:dev"));
    gulp.watch("./src/**/*.html", gulp.parallel("html:dev"));
    gulp.watch("./src/img/**.*", gulp.parallel("images:dev"));
    gulp.watch("./src/fonts/**.*", gulp.parallel("fonts:dev"));
    gulp.watch("./src/files/**.*", gulp.parallel("files:dev"));
    gulp.watch("./src/js/**.*", gulp.parallel("js:dev"));
});

