'use strict';

const rip = require('./index').rip;

rip(function(err) {
  console.log( err ? err : 'OK!');
});
