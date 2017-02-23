// example to build out ical attachments for slack messages

var ical = require('ical-generator'),
    http = require('http'),
    cal = ical({domain: 'github.com', name: 'my first iCal'});
 
// overwrite domain 
cal.domain('sebbo.net');
 
cal.createEvent({
    start: new Date(),
    end: new Date(new Date().getTime() + 3600000),
    summary: 'Example Event',
    description: 'It works ;)',
    location: 'my room',
    url: 'http://sebbo.net/'
});
 
http.createServer(function(req, res) {
    cal.serve(res);
}).listen(3000, '127.0.0.1', function() {
    console.log('Server running at http://127.0.0.1:3000/');
});