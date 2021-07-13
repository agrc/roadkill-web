module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = ['src/app/**/*.js', 'src/esrx/*.js', 'src/ext/*.js'];
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/css/**/*.css',
    ];
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];
    var packageFile = 'package.json';
    var eslintFiles = jsFiles.concat([packageFile]);

    // Project configuration.
    grunt.initConfig({
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/release_notes.html'),
                push: false
            }
        },
        clean: {
            build: ['dist']
        },
        connect: {
            uses_defaults: {}
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                load: 'build', // Optional: Utility to bootstrap (Default: 'build')
                releaseDir: '../dist',
                requires: ['src/app/run.js', 'src/app/packages.js'], // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    // exclude tests because some images in dojox throw errors
                    src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                    dest: 'src/'
                }]
            }
        },
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js',
                        'src/jquery/dist/jquery.js',
                        'src/bootstrap/dist/js/bootstrap.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            main: {
                src: jsFiles
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.js', '!proj4/**/*.js'],
                    dest: 'dist'
                }]
            }
        },
        watch: {
            eslint: {
                files: eslintFiles,
                tasks: ['newer:eslint:main', 'jasmine:main:build']
            },
            src: {
                files: eslintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.registerTask('default', ['eslint', 'jasmine:main:build', 'connect', 'watch']);

    grunt.registerTask('build-prod', [
        'clean:build',
        'newer:imagemin:main',
        'dojo:prod',
        'uglify:prod'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'newer:imagemin:main',
        'dojo:stage',
        'uglify:stage'
    ]);
    grunt.registerTask('test', [
        'eslint',
        'jasmine',
        'build-prod'
    ]);
};
