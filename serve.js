'use strict';

const createServer = require('auto-sni'); // let's encrypt https cert thingie
const express = require('express');
const cors = require('cors');

const run = require('./index').run;



run(function(err, doRecommendations) {
  console.log('catalog data res');

  const app = express();

  app.use(cors());

  app.get('/favicon.ico', function (req, res) {
    res.status(404).send(null);
  });

  app.get('/:aid/:top?', function (req, res) {
    doRecommendations(req.params.aid, req.params.top || 10, function(err, results) {
      if (err) {
        console.error(err);
        return res.status(500).send('ERROR');
      }

      res.send(results);
    });
  });

  app.all('*', function (req, res) {
    res.status(400).send('This server only supports GETs with the assetId as sole parameter');
  });

  /*createServer({
    email: 'jose.pedro.dias@gmail.com',
    domains: ['stage.sl.pt', ['stage.sl.pt']],
    agreeTos: true
  }, app);*/

  app.listen(3000, function () { console.log('ss-recomm listening to port %s...', 3000) });
});
