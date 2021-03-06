var gulp = require('gulp');
var gulpB = require('../');
var expect = require('chai').expect;
var es = require('event-stream');
var path = require('path');
var browserify = require('browserify');

var postdata;

describe('gulp-browserify', function() {
	var testFile = path.join(__dirname, './test.js');
  var outputFile;

	beforeEach(function(done) {
    vfile = null;
		gulp.src(testFile)
			.pipe(gulpB())
			.on('postbundle', function(data) {
				postdata = data;
			})
			.pipe(es.map(function(file){
				outputFile = file;
				done();
			}))
	})

	it('should return a buffer', function(done) {
		expect(outputFile.contents).to.be.an.instanceof(Buffer);
		done();
	})

  it('should be a valid vinyl file object', function() {
    expect(outputFile.cwd).to.be.a('string', 'file.cwd is not a string');
    expect(outputFile.base).to.be.a('string', 'file.base is not a string');
    expect(outputFile.path).to.be.a('string', 'file.path is not a string');
  })
	
	it('should bundle modules', function(done) {
		var b = browserify();
		var chunk = '';
		b.add(testFile)
		b.bundle().on('data', function(data) {
			chunk += data;
		}).on('end', function() {
			expect(outputFile.contents.toString()).to.equal(chunk);
			done();
		})
	})


	it('should emit postbundle event', function(done) {
		expect(outputFile.contents.toString()).to.equal(postdata);
		done();
	})

	it('should use the gulp version of the file', function(done) {
		gulp.src(testFile)
			.pipe(es.map(function(file, cb) {
				file.contents = new Buffer('var abc=123;');
				cb(null, file);
			}))
			.pipe(gulpB())
			.pipe(es.map(function(file) {
				expect(file.contents.toString()).to.not.equal(outputFile.contents.toString());
				expect(file.contents.toString()).to.match(/var abc=123;/);
				done();
			}))
	})
})

