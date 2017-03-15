'use strict';

const express = require('express');

const run = require('./index');

const PORT = 3000;



run(function(err, doRecommendations) {
  console.log('catalog data res');

  const app = express();

  app.get('/:aid', function (req, res) {
    doRecommendations(req.params.aid, 10, function(err, results) {
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

  app.listen(PORT, function () {
    console.log('ss-recomm listening to port %s...', PORT)
  });
});
