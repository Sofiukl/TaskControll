module.exports = function(grunt) {

/* grunt.registerTask('default', 'Log some stuff.', function() {
    grunt.log.write('Logging some stuff...').ok();
  });
*/

grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

      jshint: {
        "globals": {
            "angular"   : true,
            "jasmine"   : false,
            "$"         : false,
            "_"         : false,
            "module"    : false,
            "require"   : false
        },
        files: {
          src: ['src/app/modules/client/**/*.js']
        }
    },

    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/app/modules/**/*Controller.js'],
        dest: 'src/app/lib/all.controller.js',
      },
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
          '<%= grunt.template.today("yyyy-mm-dd") %> */',
        mangle : false
        },
        my_target: {
          files: {
            'src/app/lib/taskControllApp/all.controllers.min.js': ['<%=concat.dist.src %>'],
            'src/app/lib/taskControllApp/all.validator.min.js': ['src/app/modules/**/*Validator.js'],
            'src/app/lib/taskControllApp/all.services.min.js': ['src/app/modules/**/*Service.js'],
            'src/app/lib/taskControllApp/all.factory.min.js': ['src/app/modules/**/*Factory.js'],
          }
        }
  },
  watch: {
    src: {
      files: ['src/app/modules/**/*Controller.js'],
      tasks: ['default'],
    }
  },

});

grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-watch');
/*
 Task registration goes here
  You can register multiple task here one by one
*/
grunt.registerTask('default',['concat','uglify']);

};
