var express = require('express');
var mu = require('mu2');
var pg = require('pg');

var app = express();
var client = new pg.Client({database: process.env.DATABASE_URL});

function handleError(err){
  if (err) console.log(err);
}

pg.connect(process.env.DATABASE_URL, function(err, client, done){

  client.query('CREATE TABLE IF NOT EXISTS counter (address TEXT)', function(err, result){
    handleError(err);

    app.get('/', function(req, res){
      client.query('INSERT INTO counter (address) VALUES ($1)', req.ip, function(err, result){
        client.query('SELECT COUNT(*) AS c FROM counter', null, function (err, result){
          visits = result.rows[0].count;
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
  });
  var port = 3000;
  app.listen(port);
  console.log('Listening on port ' + port + '.');

});
