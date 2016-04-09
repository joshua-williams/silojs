module.exports = function(grunt){
	grunt.initConfig({
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: [
			      'lib/global.js',
			      'lib/silo.js',
			      'lib/loader.js',
			      'lib/cache.js',
			      'lib/router.js',
			      'lib/view.js',
			      'lib/bind.js'
				],
				dest: 'dist/silo.js'
			}
		},
		
		watch: {
			scripts: {
				files: ['lib/*.js'],
				tasks: ['concat']
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.registerTask('default', ['concat','watch']);
}