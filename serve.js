'use strict';

const createServer = require('auto-sni'); // let's encrypt https cert thingie
const express = require('express');
const cors = require('cors');

const run = require('./index').run;



run(function(err, actions) {
  console.log('catalog data res');

  const app = express();

  app.use(cors());

  app.get('/favicon.ico', function (req, res) {
    res.status(404).send(null);
  });

  app.get('/suggest/:aid/:top?', function (req, res) {
    actions.suggest(req.params.aid, req.params.top || 10, function(err, results) {
      if (err) {
        console.error(err);
        return res.status(500).send('ERROR');
      }

      res.send(results);
    });
  });

  app.get('/suggest/*', function (req, res) {
    res.status(400).set('Content-Type', 'text/plain').send('suggest accepts /<asset id>/<nr of results, defaults to 10>');
  });

  app.get('/autocomplete/:needle/:top?', function (req, res) {
    actions.autocomplete(req.params.needle, req.params.top || 10, function(err, results) {
      if (err) {
        console.error(err);
        return res.status(500).send('ERROR');
      }

      res.send(results);
    });
  });

  app.get('/autocomplete/*', function (req, res) {
    res.status(400).set('Content-Type', 'text/plain').send('autocomplete accepts /<needle>/<nr of results, defaults to 10>');
  });

  app.all('*', function (req, res) {
    res.status(400).set('Content-Type', 'text/plain').send('This server only supports GETs for the suggest and autocomplete slugs');
  });

  /*createServer({
    email: 'jose.pedro.dias@gmail.com',
    domains: ['stage.sl.pt', ['stage.sl.pt']],
    agreeTos: true
  }, app);*/

  app.listen(3000, function () { console.log('ss-recomm listening to port %s...', 3000) });
});
