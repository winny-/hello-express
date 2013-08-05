var express = require('express');
var mu = require('mu2');
var sqlite3 = require('sqlite3');

var app = express();
var db = new sqlite3.Database('data.sqlite3');
db.serialize();
db.exec('CREATE TABLE IF NOT EXISTS counter (address TEXT)');


app.get('/', function(req, res){
  db.serialize(function (){
    db.run('INSERT INTO counter (address) VALUES ($address)', {$address: req.ip});

    db.get('SELECT COUNT(*) AS c FROM counter', function (err, row){
      visits = row.c;
      var body = '';

      var stream = mu.compileAndRender('hello.html', {title: 'Hello, world!', ip: req.ip, visits: visits });

      res.setHeader('Content-Type', 'text/html');

      stream.on('data', function (data){
        body += data.toString();
      });

      stream.on('end', function (){
        res.setHeader('Content-Length', body.length);
        res.end(body);
      });

    });
  });
});


var port = 3000;
app.listen(port);
console.log('Listening on port ' + port + '.');
