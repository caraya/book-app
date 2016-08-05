// Require Gulp first
import gulp from 'gulp';
// utilities
import del from 'del';
import path from 'path';
import gulpif from 'gulp-if';
// load-plugins
import gulpLoadPlugins from "gulp-load-plugins";
import pkg from "./package.json";
// Imagemin plugins that don't use gulp-
import mozjpeg from 'imagemin-mozjpeg';
import webp from 'imagemin-webp';
// SASS related
import sass from 'gulp-sass';
import sassdoc from 'sassdoc';
import scsslint from 'gulp-scss-lint';
// Static Web Server stuff
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback';
// svg sprites
import cheerio from 'gulp-cheerio';
import svgmin from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';

const reload = browserSync.reload;
const $$ = gulpLoadPlugins({lazyLoad: true});
const site = 'https://caraya.github.io/athena-template/';
//const key = '';

// List of browser versions we'll autoprefix for.
const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

//// Local functions to use in tasks
/**
 * Function to log messages to output stream
 *
 * Taken from {@link http://johnpapa.net/|John Papa}'s Pluralsight course on
 * Gulp
 */
function log(msg) {
  var item;
  if (typeof (msg) === 'object') {
    for (item in msg) {
      if (msg.hasOwnProperty(item)) {
        $$.util.log($$.util.colors.inverse(msg[item]));
      }
    }
  } else {
    $$.util.log($$.util.colors.inverse(msg));
  }
}

/**
 * Function to delete a given path. We specify the path in the task we create
 * @param {string} path - Path to delete
 * @param  done - indicates we've completed the task
 */
function clean(path, done) {
  log('Cleaning ' + $$.util.colors.red(path));
  del(path, done);
}

/**
 * Custom error logger
 * @param error {} - Error message to display
 */
function errorLogger(error) {
  log('*** Error Start ***');
  log(error);
  log('*** Error End ***');
  this.emit('end');
};

/**
 * @name babel
 *
 * @description Transpiles ES6 to ES5 using Babel
 *
 * @see {@link http://babeljs.io/|Babeljs}
 */
gulp.task('babel', (done) => {
  log('Transpiling Babel Code to ES5');
  return gulp
    .src('app/es6/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['stage-3', 'es2015']
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('app/js/'))
    .pipe($.size({
      pretty: true,
      title: 'Babel'
    }));
})

/**
 * @name babelNext
 *
 * @description Transpiles ESNext to ES6 using Babel.
 *
 * The way this work can change at any time without warning as it uses
 * things at stage 0 in the TC39 pipeline. Use at your own risk
 *
 * @see {@link https://tc39.github.io/process-document/|TC 39 Process Document}
 * @see {@link http://www.2ality.com/2015/11/tc39-process.html|TC 39 Process Document Explained}
 *
 */
gulp.task('babelNext', () => {
  log('Transpiling experimental ESNext to ES5');
  return gulp.src('app/es6/**/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['stage-0']
    }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('app/js/experimental'))
    .pipe($.size({
      pretty: true,
      title: 'Babel Experimental'
    }));
});


/**
 * @name coffee
 *
 * @description Transpiles Coffeescript to ES5
 *
 * @see {@link http://coffeescript.org/|Coffeescript website}
 */
gulp.task('coffee', () => {
  log('Transpiling coffeescript');
  return gulp.src('app/coffee/**/*.coffee')
    .pipe($$.sourcemaps.init())
    .pipe($$.coffee())
    .pipe($$.sourcemaps.write())
    .pipe(gulp.dest('app/js/'))
      .pipe($$.size({
      pretty: true,
      title: 'Coffee'
    }));
});

/**
 * @name typescript
 *
 * @description Experimental Typescript support.
 *
 * Uses gulp-typescript, gulp-tslint and tslint (peer dependency of gulp-tslint)
 *
 * @see {@link http://www.typescriptlang.org/|Typescript Language site}
 */
gulp.task('typescript', () => {
  log('Transpiling Typescript');
  return gulp.src('app/ts/**/*.ts')
    .pipe($$.ts({
      noImplicitAny: true,
      out: 'scripts-ts.js',
      target: 'es5'
    }))
    .pipe($.tslint())
    .pipe($.tslint.report('verbose', { emitError: false }))
    .pipe(gulp.dest('app/js'));
});

// Javascript style and syntax validation
//

/**
 * @name js-lint
 *
 * @description runs jshint on the gulpfile and all files under app/js
 *
 * *RUN THE TASK BELOW AFTER TRANSPILING ES6, TYPESCRIPT AND COFFEE FILES*
 *
 * @see {@link http://jshint.com/docs/|JSHint Docs}
 */
gulp.task('js-lint', () => {
  return gulp.src(['gulpfile.js', 'app/js/**/*.js'])
    .pipe($$.jshint())
    .pipe($$.jshint.reporter('jshint-stylish', {verbose: true}));
});

/**
 * @name js-style
 *
 * @description Run jscs on all file under js
 *
 * @see {@link http://jscs.info/|JSCS Docs}
 */
gulp.task('js-style', () => {
  return gulp.src(['app/js/**/*.js'])
    .pipe($$.jscs())
    .pipe($$.jscs.reporter())
    .pipe($$.size({
      pretty: true,
      title: 'jscs'
    }));
});

/**
 * @name jsdoc:gulpfile
 * @description runs JSDOC on gulp file. Later tasks will add documentation
 * to service worker and our own scripts
 */
gulp.task('jsdoc:gulpfile', function (done) {
  var config = require('./conf.json');
  gulp.src(['GULP-README.md', './gulpfile.js'], {read: false})
    .pipe($$.jsdoc3(config, done));
});
/**
 *
 * @name sass:dev
 *
 * @description Run SASS in development mode with expanded content.
 *
 * We don't compress here as we'll compress during post processing.
 */
gulp.task('sass:dev', (done) => {
  $.sass('app/scss/main.scss', { sourcemap: true, style: 'expanded'})
    .pipe(gulp.dest('app/css'))
    .pipe($$.size({
      pretty: true,
      title: 'SASS'
    }));
  done();
});

/**
 *
 * @name sass:production
 *
 * @description Creates SASS code optimized for production
*/
gulp.task('sass:production', (done) => {
  $$.sass('app/scss/**/*.scss', { sourcemap: true, style: 'compressed'})
    .pipe(gulp.dest('app/css'))
    .pipe($$.size({
      pretty: true,
      title: 'SASS'
    }));
  done();
});


/**
 *
 * @name scsslint
 *
 * @description uses {@link https://github.com/brigade/scss-lint|scss-lint} to do code style checking on the SASS flles
 *
 * @see {@link https://github.com/brigade/scss-lint|scss-lint}
 *
 */
gulp.task('scsslint', () => {
  return gulp.src(['app/scss/**/*.scss'])
    .pipe(scsslint({
      'reporterOutputFormat': 'Checkstyle'
    }));
});


/**
 *
 * @name sassdoc
 *
 * @description runs sassdoc on sass files to generate documentation
 *
 * @see {@link http://sassdoc.com/|sassdoc}
 */
gulp.task('sassdoc', () => {
  return gulp.src('app/sass/**/*.scss')
    .pipe(sassdoc({
      dest: 'app/sassdocs',
      verbose: true,
      display: {
        access: ['public', 'private'],
        alias: true
      }
    }));
});

/**
 *
 * @name processCSS
 *
 * @description Run autoprefixer and cssnano in the css generated by
 * sass.
 *
 * The versions of browsers to run autoprefixer against are defined in
 * the variable AUTOPREFIXER_BROWSERS.
 *
 * Requires `sass:dev` to run before this task
*/
gulp.task('processCSS', gulp.series('sass:dev'), () => {
  return gulp.src('app/css/**/*.css')
//    .pipe($.changed('app/css/**/*.css', {extension: '.css'}))
    .pipe($$.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($$.sourcemaps.init())
    .pipe($$.cssnano({autoprefixer: false}))
    .pipe($$.sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe($$.size({
      pretty: true,
      title: 'processCSS'
    }));
});

/**
 *
 * @name uncss
 * @description Taking a css and an html file, UNCSS will strip all CSS selectors not used in the page @see {@link https://github.com/giakki/uncss|UNCSS}
 */
gulp.task('uncss', () => {
  return gulp.src('app/css/**/*.css')
    .pipe($$.concat('main.css'))
    .pipe($$.uncss({
      html: ['index.html']
    }))
    .pipe(gulp.dest('dist/css/all-clean.css'))
    .pipe($$.size({
      pretty: true,
      title: 'Uncss'
    }));
});


/**
 * @name useref
 * @description Parse build blocks in HTML files to replace references to non-optimized scripts or stylesheets.
 */
gulp.task('useref', () => {
  return gulp.src('app/*.html')
    .pipe($$.useref({ searchPath: '.tmp' }))
    .pipe(gulp.dest('dist/*.html'));
});

/**
 * @name critical
 * @description Generate & Inline Critical-path CSS
 *
 * @see {@link https://github.com/addyosmani/critical|Crticall by Addy Osmani}
 * @see {@link https://developers.google.com/web/fundamentals/performance/critical-rendering-path/?hl=en|Critical Rederning Path -- Google Web Fundamentals}
 */
gulp.task('critical', () => {
  return gulp.src('app/*.html')
    .pipe($$.critical({
      base: 'app/',
      inline: true,
      css: ['app/css/main.css'],
      minify: true,
      extract: false,
      ignore: ['font-face'],
      dimensions: [{
        width: 320,
        height: 480
      }, {
        width: 768,
        height: 1024
      }, {
        width: 1280,
        height: 960
      }]
    }))
    .pipe($.size({
      pretty: true,
      title: 'Critical'
    }))
    .pipe(gulp.dest('dist'));
});

/**
 * @name psi-mobile
 *
 * @description Performance check using Google Page Speed Insight
 *
 * Use the `nokey` option to try out PageSpeed Insights as part of your
 * build process. For more frequent use, we recommend registering for your own API key.
 *
 * We have different commands for desktop and mobile checks
 *
 * For more info: {@link https://developers.google.com/speed/docs/insights/v2/getting-started|https://developers.google.com/speed/docs/insights/v2/getting-started}
 */
gulp.task('psi-mobile', () => {
  return $S.psi(site, {
    // key: key
    nokey: 'true',
    strategy: 'mobile'
  }).then(function (data) {
    console.log('Speed score: ' + data.ruleGroups.SPEED.score);
    console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
  });
});

/**
 * @name psi-desktop
 *
 * @description Performance check using Google Page Speed Insight
 * Use the `nokey` option to try out PageSpeed Insights as part of your build process.
 *
 * For more frequent use, we recommend registering for your own API key.
 *
 * We have different commands for desktop and mobile checks
 *
 * For more info: {@link https://developers.google.com/speed/docs/insights/v2/getting-started|https://developers.google.com/speed/docs/insights/v2/getting-started}
 */
gulp.task('psi-desktop', () => {
  return $$.psi(site, {
    nokey: 'true',
    // key: key,
    strategy: 'desktop'
  }).then(function (data) {
    console.log('Speed score: ' + data.ruleGroups.SPEED.score);
  });
});

/**
 * @name imagemin
 * @description compresses and optmizes images to reduce the number of bytes
 * going over the network and thus increases performance both real and
 * user's perception
 *
 * @see {@link https://github.com/imagemin/imagemin|imagemin}
 * @see {@link https://github.com/sindresorhus/gulp-imagemin|gulp-imagemin}
 */
gulp.task('imagemin', () => {
  return gulp.src('app/images/*')
    .pipe($$.imagemin({
      progressive: true,
      svgoPlugins: [
        {removeViewBox: false},
        {cleanupIDs: false}
      ],
      use: [mozjpeg()]
    }))
    .pipe(webp({quality: 50})())
    .pipe(gulp.dest('app/images'))
    .pipe($$.size({
      pretty: true,
      title: 'imagemin'
    }));
});

/**
 * @name process-images
 * @description process-images combines a responsive-image generation task with
 * imagemin
 * but will only work with JPG and PNG images (you don't need to generate
 * optimized SVG and GIF is useless at larger resolutions.)
 *
 * I'm keeping imagemin as a separate task because there may be times when I
 * only want to compress images without generating multiple versions of them
 */
gulp.task('processImages', () => {
  return gulp.src(['app/images/**/*.{jpg,png}', '!app/images/touch/*.png'])
    .pipe($$.responsive({
      '*.jpg': [{
        // image-small.jpg is 200 pixels wide
        width: 200,
        rename: {
          suffix: '-small',
          extname: '.jpg'
        }
      }, {
        // image-small@2x.jpg is 400 pixels wide
        width: 200 * 2,
        rename: {
          suffix: '-small@2x',
          extname: '.jpg'
        }
      }, {
        // image-large.jpg is 480 pixels wide
        width: 480,
        rename: {
          suffix: '-large',
          extname: '.jpg'
        }
      }, {
        // image-large@2x.jpg is 960 pixels wide
        width: 480 * 2,
        rename: {
          suffix: '-large@2x',
          extname: '.jpg'
        }
      }, {
        // image-extralarge.jpg is 1280 pixels wide
        width: 1280,
        rename: {
          suffix: '-extralarge',
          extname: '.jpg'
        }
      }, {
        // image-extralarge@2x.jpg is 2560 pixels wide
        width: 1280 * 2,
        rename: {
          suffix: '-extralarge@2x',
          extname: '.jpg'
        }
      }, {
        // image-small.webp is 200 pixels wide
        width: 200,
        rename: {
          suffix: '-small',
          extname: '.webp'
        }
      }, {
        // image-small@2x.webp is 400 pixels wide
        width: 200 * 2,
        rename: {
          suffix: '-small@2x',
          extname: '.webp'
        }
      }, {
        // image-large.webp is 480 pixels wide
        width: 480,
        rename: {
          suffix: '-large',
          extname: '.webp'
        }
      }, {
        // image-large@2x.webp is 960 pixels wide
        width: 480 * 2,
        rename: {
          suffix: '-large@2x',
          extname: '.webp'
        }
      }, {
        // image-extralarge.webp is 1280 pixels wide
        width: 1280,
        rename: {
          suffix: '-extralarge',
          extname: '.webp'
        }
      }, {
        // image-extralarge@2x.webp is 2560 pixels wide
        width: 1280 * 2,
        rename: {
          suffix: '-extralarge@2x',
          extname: '.webp'
        }
      }, {
        // Global configuration for all images
        // Strip all metadata
        withMetadata: true
      }]
    }));

});

/**
 * @name copy
 *
 * @description generic copy function. Excludes fonts, and bower components
 * as those are handled by more specific copy tasks
 */
gulp.task('copyAssets', () => {
  return gulp.src([
    'app/**/*',
    '!app/coffee',
    '!app/es6',
    '!app/scss',
    '!app/test',
    '!app/bower_components',
    '!app/fonts',
    '!app/cache-config.json',
    '!**/.DS_Store' // Mac specific directory we don't want to copy over
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({
      pretty: true,
      title: 'copy'
    }));
});

/**
 * @name copyBower
 *
 * @description Copies the content of bower. It's more generic than
 * copyBower:polymer and it excludes Polymer related bower components
 */
gulp.task('copyBower', () => {
 return gulp.src([
   '!bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*',
   'bower_components/**/*'
 ], {
   dot: false
 }).pipe(gulp.dest('dist/elements'))
   .pipe($.size({
     pretty: true,
     title: 'copy'
   }));
});

/**
 * @name copyBower:polymer
 *
 * @description copies the following directories under `bower_components` to
 * the distribution's element directory
 *
 * * webcomponentsjs
 * * platinum-sw
 * * sw-toolbox
 * * promise-polyfill
 */
gulp.task('copyBower:polymer', () => {
  // Copy over only the bower_components we need
  // These are things which cannot be vulcanized
  return gulp.src([
    'bower_components/{webcomponentsjs,platinum-sw,sw-toolbox,promise-polyfill}/**/*'
  ], {
    dot: false
  }).pipe(gulp.dest('dist/elements'))
    .pipe($.size({
      pretty: true,
      title: 'copy bower elements'
    }));
});

/**
 * @name copyFonts
 *
 * @description copies font to distribution
 */
gulp.task('copyFonts', () => {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts/'))
    .pipe($.size({
      title: 'fonts'
    }));
});

/**
 * @name clean
 *
 * @description deletes `dist/`, and `.tmp` directories and all the webp images
 */
gulp.task('clean', (done) => {
  del.sync([
    'dist/',
    '.tmp',
    'app/images/**/*.webp'
  ]);
  done();
});

/**
 * @name deploy
 *
 * @description Deploys the content from dist/ into the repository's gh-pages branch
 *
 * We do this so we can take advantage of HTTPs in gh-pages. If you're
 * deploying to different servers you're on your own :-)
 */
gulp.task('deploy', () => {
  return gulp.src('./dist/**/*')
    .pipe($$.ghPages())
    .pipe($$.size({
      title: 'deploy'
    }));
});

/**
 * @name bower
 * @description Install bower components. Equivalent to running bower install
 * at the root of the app
 */
gulp.task('bower', () => {
  return $$.bower();
});


/**
 * @name watch
 *
 * @description watches for different file types. Not sure if this is going
 * to work as is or if it needs to be edited to add functionality
 *
 * May have to be moved to server to make sure it works as intended
 */
gulp.task('watch', () => {
  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/css/**/*.scss'], gulp.series('sass:dev', 'processCSS'), reload);
  gulp.watch(['app/images/**/*'], reload);
});


/**
 * @name svgstore
 *
 * @description creates a sprite sheet from a set of icons
 */
gulp.task("svgstore", function () {
  return gulp
    .src("app/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      fileName: "sprite.svg",
      prefix: "icon-" }))
    .pipe(cheerio({
      run: function ($) {
        $("[fill]").removeAttr("fill");
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(gulp.dest("app/images"));
});


/**
 * @name server
 *
 * @description Watch files for changes and reload
 *
 * Run as an https by uncommenting `https: true`
 *
 * **Note**: this uses an unsigned certificate which on first access will
 * present a certificate warning in the browser.
 *
 * This version serves content from the app source directory
 */
gulp.task('server', () => {
  return browserSync({
    port: 2509,
    notify: false,
    logPrefix: 'ATHENA',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },

    // https: true,
    server: {
      baseDir: ['.tmp', 'app'],
      middleware: [historyApiFallback()]
    }
  })
});

/**
 * @name server:dist
 * @description Serves content from the dist directory. I use this mostly to
 * troubleshoot
 */
gulp.task('server:dist', () => {
  return browserSync({
    port: 5001,
    notify: false,
    logPrefix: 'ATHENA',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function (snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist/',
    middleware: [historyApiFallback()]
  })
});

// COMBINED TASKS
// Prepating content
gulp.task('prep',
  gulp.series(
    'clean',
    gulp.parallel('copyAssets', 'copyBower', 'copyFonts'),
    'processImages'
  ));

gulp.task('app',
  gulp.series('server', 'watch'));

gulp.task('distribution',
  gulp.series('server:dist'));
