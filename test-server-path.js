// Test server import via /server path
const { TracklyticServer } = require('./dist/server');

console.log('TracklyticServer imported via /server path:', typeof TracklyticServer);

// Test creating an instance
const tracklytic = new TracklyticServer({
  token: 'test-token',
  project: 'test-project'
});

console.log('TracklyticServer instance created successfully'); 