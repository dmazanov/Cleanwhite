var gulp = require('gulp'),
		jade = require('gulp-jade'),
		prettify = require('gulp-prettify'),
		wiredep = require('wiredep').stream,
		useref = require('gulp-useref'),
		uglify = require('gulp-uglify'),
		clean = require('gulp-clean'),
		gulpif = require('gulp-if'),
		filter = require('gulp-filter'),
		size = require('gulp-size'),
		imagemin = require('gulp-imagemin'),
		concatCss = require('gulp-concat-css'),
		minifyCss = require('gulp-minify-css'),
		browserSync = require('browser-sync').create(),
		sass = require('gulp-sass'),
		gutil = require('gulp-util'),
		ftp = require('vinyl-ftp'),
		sourcemaps = require('gulp-sourcemaps'),
		autoprefixer = require('gulp-autoprefixer'),
		reload = browserSync.reload;


// ====================================================
// ====================================================
// ============== Локальная разработка APP ============

// Компилируем Jade в html
gulp.task('jade', function() {
		gulp.src('app/templates/pages/*.jade')
		.pipe(jade({
				pretty: true
			}))
		.on('error', log)
		.pipe(gulp.dest('app/'))
		.pipe(reload({stream: true}));
});


// Подключаем ссылки на bower 
gulp.task('wiredep', function () {
	gulp.src('app/templates/common/*.jade')
		.pipe(wiredep({
			ignorePath: /^(\.\.\/)*\.\./,
			exclude:['bower/modernizr/modernizr.js']
		}))
		.pipe(gulp.dest('app/templates/common/'))
});


// Static Server + watching scss/html files
gulp.task('serve', ['jade', 'sass'], function() {

		browserSync.init({
				server: "./app"
		});

		gulp.watch('app/templates/**/*.jade', ['jade']);
		gulp.watch('bower.json', ['wiredep']);
		gulp.watch("app/scss/*.scss", ['sass']);
		gulp.watch("app/js/**/*.js").on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
		return gulp.src([
			"app/scss/*.scss",
			"app/scss/**/*css"
			])
				.pipe(sourcemaps.init())
				.pipe(sass())
				.pipe(autoprefixer())
				.pipe(sourcemaps.write())
				.pipe(gulp.dest("app/css"))
				.pipe(browserSync.stream());
});


gulp.task('default', ['serve']);



// ====================================================
// ====================================================
// ===================== Функции ======================

// Более наглядный вывод ошибок
var log = function (error) {
	console.log([
		'',
		"----------ERROR MESSAGE START----------",
		("[" + error.name + " in " + error.plugin + "]"),
		error.message,
		"----------ERROR MESSAGE END----------",
		''
	].join('\n'));
	this.end();
}

// ====================================================
// ====================================================
// =============== Важные моменты  ====================
// gulp.task(name, [deps], fn) 
// deps - массив задач, которые будут выполнены ДО запуска задачи name
// внимательно следите за порядком выполнения задач!



// ====================================================
// ====================================================
// ================= Сборка DIST ======================

// Очистка папки
gulp.task('clean', function () {
	return gulp.src('dist')
		.pipe(clean());
});

// Переносим HTML, CSS, JS в папку dist 
gulp.task('useref', function () {
	var assets = useref.assets();
	return gulp.src('app/*.html')
		.pipe(assets)
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', minifyCss({compatibility: 'ie8'})))
		.pipe(assets.restore())
		.pipe(useref())
		.pipe(gulp.dest('dist'));
});

// Перенос шрифтов
gulp.task('fonts', function() {
	gulp.src('app/fonts/*')
		.pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
		.pipe(gulp.dest('dist/fonts/'))
});

// Картинки
gulp.task('images', function () {
	return gulp.src('app/img/**/*')
		.pipe(imagemin({
			progressive: true,
			interlaced: true
		}))
		.pipe(gulp.dest('dist/img'));
});

// Остальные файлы, такие как favicon.ico и пр.
gulp.task('extras', function () {
	return gulp.src([
		'app/*.*',
		'!app/*.html'
	]).pipe(gulp.dest('dist'));
});

// Сборка и вывод размера содержимого папки dist
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
	return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// Собираем папку DIST (только после компиляции Jade)
gulp.task('build', ['clean', 'jade'], function () {
	gulp.start('dist');
});

// Проверка сборки
gulp.task('server-dist',  function() {
		browserSync.init({
				server: "./dist"
		});
});
