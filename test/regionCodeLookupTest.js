var tape = require('tape');
var Document = require('pelias-model').Document;
var eventStream = require('event-stream');
var regionCodeLookup = require('../index');

function test_stream(input, testedStream, callback) {
    var input_stream = eventStream.readArray(input);
    var destination_stream = eventStream.writeArray(callback);

    input_stream.pipe(testedStream).pipe(destination_stream);
}

tape('createPeliasDocGenerator', function(test) {
  test.test('unsupported country but supported region should not set admin1_abbr', function(t) {
    var inputDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3( 'XYZ' )
                    .setAdmin( 'admin1', 'Pennsylvania');

    var expectedDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3( 'XYZ' )
                    .setAdmin( 'admin1', 'Pennsylvania');

    var stream = regionCodeLookup.createStream();

    test_stream([inputDoc], stream, function(err, actual) {
      t.deepEqual(actual, [expectedDoc], 'should not have changed admin1_abbr');
      t.end();
    });

  });

  test.test('supported country but unsupported region should not set admin1_abbr', function(t) {
    var inputDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3('USA')
                    .setAdmin( 'admin1', 'unsupported region' );

    var expectedDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3('USA')
                    .setAdmin( 'admin1', 'unsupported region' );

    var stream = regionCodeLookup.createStream();

    test_stream([inputDoc], stream, function(err, actual) {
      t.deepEqual(actual, [expectedDoc], 'should not have changed admin1_abbr');
      t.end();
    });

  });

  test.test('supported country and supported region should override admin1_abbr', function(t) {
    var inputDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3('USA')
                    .setAdmin( 'admin1', 'Pennsylvania' )
                    .setAdmin( 'admin1_abbr', 'NY' );

    var expectedDoc = new Document( 'whosonfirst', '1')
                    .setAlpha3('USA')
                    .setAdmin( 'admin1', 'Pennsylvania' )
                    .setAdmin( 'admin1_abbr', 'PA' );

    var stream = regionCodeLookup.createStream();

    test_stream([inputDoc], stream, function(err, actual) {
      t.deepEqual(actual, [expectedDoc], 'should have overridden with correct abbreviation');
      t.end();
    });

  });

});
