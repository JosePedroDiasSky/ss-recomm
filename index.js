'use strict';

const CFG = require('./config.json');

const fs = require('fs');

const request = require('request'); // https://github.com/request/request
const async = require('async'); // http://caolan.github.io/async/ https://github.com/caolan/async
const _ = require('lodash');


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set#Implementing_basic_set_operations
Set.prototype.intersection = function(setB) {
  const inter = new Set();
  for (const elem of setB) {
    if (this.has(elem)) { inter.add(elem); }
  }
  return inter;
}

Set.prototype.intersectionCount = function(setB) {
  let n = 0;
  for (const elem of setB) {
    if (this.has(elem)) { ++n; }
  }
  return n;
}



function updateCatalog(cb) {
  request(
    {
      url: `${CFG.endpoint}?api_key=${CFG.apiKey}`,
    },
    function(err, res, body) {
      if (err) { return cb(err); }
      const assets = JSON.parse(body).content.assets;
      fs.writeFile('cache/catalog.json', JSON.stringify(assets), function(err) {
        if (err) { return cb(err); }
        cb(null, assets);
      });
    }
  )
}



function readCatalog(cb) {
  fs.readFile('cache/catalog.json', function(err, st) {
    if (err) { return cb(err); }
    cb(null, JSON.parse( st.toString() ));
  })
}



function updateAsset(aId, cb) {
  request(
    {
      url: `${CFG.endpoint}/${aId}?api_key=${CFG.apiKey}`,
    },
    function(err, res, body) {
      if (err) { return cb(err); }
      const asset = JSON.parse(body).content;;
      fs.writeFile(`cache/${aId}.json`, JSON.stringify(asset), function(err) {
        if (err) { return cb(err); }
        cb(null, asset);
      });
    }
  )
}



function updateAsset(aId, cb) {
  request(
    {
      url: `${CFG.endpoint}/${aId}?api_key=${CFG.apiKey}`,
    },
    function(err, res, body) {
      if (err) { return cb(err); }
      const asset = JSON.parse(body).content;;
      fs.writeFile(`cache/${aId}.json`, JSON.stringify(asset), function(err) {
        if (err) { return cb(err); }
        cb(null, asset);
      });
    }
  )
}



function readAsset(aId, cb) {
  fs.readFile(`cache/${aId}.json`, function(err, st) {
    if (err) { return cb(err); }
    cb(null, JSON.parse( st.toString() ));
  })
}



function updateAllAssets(assets, cb) {
  const ids = assets.map(function(a) { return a.id; });
  async.eachLimit(
    ids, // coll
    8, // limit
    updateAsset, // iteratee
    cb
  );
}



function readAllAssets(cb) {
  readCatalog(function(err, assets) {
    if (err) { return cb(err); }
    const ids = assets.map(function(a) { return a.id; });
    async.mapLimit(
      ids, // coll
      8, // limit
      readAsset, // iteratee
      function(err, arr) {
        if (err) { return cb(err); }
        const o = new Map(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
        arr.forEach(function(a) {
          o.set(a.id, simplifyAsset(a));
        });
        cb(null, o);
      }
    );
  });
}



function _getId(o) { return o.id; }
function _getName(o) { return o.name; }
function _getLabel(o) { return o.label; }

function simplifyAsset(o) {
  return {
    a: new Set( o.actors    ? o.actors.map(_getId).slice(0,3)    : [] ),
    d: new Set( o.directors ? o.directors.map(_getId).slice(0,3) : [] ),
    g: new Set( o.genres    ? o.genres.map(_getId).slice(0,3)    : [] )/*,
    s: new Set( o.shortSynopsis  ? o.shortSynopsis.map(_getId)  : [] )*/
  }
}

/*function tf(doc, term) {
  let result = 0;
  const parts = doc.split(' ');
  // TODO: Exclude stop words and punctuation
  for (let part of parts) {
    if(part.toLowerCase() === term.toLowerCase()) {
      ++result;
    }
  }
  return result / parts.length;
}

function idf(docs, term) {
  var result = 0;
  for (var doc of docs) {
    var parts = doc.split(' ');
    for(var part of parts) {
      if(part.toLowerCase() === term.toLowerCase()){
        result++;
        break;
      }
    }
  }
  var weight = docs.length/result;
  return weight > 0 ? Math.log(weight) : 0;
}

function tfIdf(doc, docs, term){
  return tf(doc term) * idf(docs, term);
}*/

function _sig(n) { return (n < 0 ? -1 : (n > 0 ? 1 : 0) ); }
function _byV(a, b) { return _sig(a.v - b.v); }
function _byV_(a, b) { return _sig(b.v - a.v); }

function applyHeuristic(assetMap, aId, heuristicFn, topN) {
  const arr = [];
  const a1 = assetMap.get(aId);
  for (const k of assetMap.keys()) {
    if (k === aId) { continue; }
    const a2 = assetMap.get(k);
    //const v = heuristicFn(a1, a2); if (v > 0) { console.log(k, v); }
    arr.push({i:k, v:heuristicFn(a1, a2), w:a2.why});
  }
  arr.sort(_byV_);
  return arr.slice(0, topN);
}



// d6bd31cd-e0a3-4372-9c49-d52d1f83554e the matrix
// fcdef8e2-273f-446a-b934-9ccf0da07fa2 the matrix reloaded
// 77567476-81de-42b6-bf09-eb0e53e7f139 the matrix revolutions
function h0(A, B) {
  let n = 0;
  n += 10 * A.a.intersectionCount(B.a);
  n +=  6 * A.d.intersectionCount(B.d);
  n +=      A.g.intersectionCount(B.g);
  return n;
}

function h00(A, B) {
  let n = 0;
  const numA = A.a.intersectionCount(B.a);
  const numD = A.d.intersectionCount(B.d);
  const numG = A.g.intersectionCount(B.g);
  B.why = [numA, numD, numG];
  n += 10 * numA;
  n +=  6 * numD;
  n +=      numG;
  return n;
}

function h000(A, B) {
  let n = 0;
  const numA = Array.from( A.a.intersection(B.a) );
  const numD = Array.from( A.d.intersection(B.d) );
  const numG = Array.from( A.g.intersection(B.g) );
  B.why = [numA, numD, numG];
  n += 10 * numA.length;
  n +=  6 * numD.length;
  n +=      numG.length;
  return n;
}

function h1(A, B) {
  let n = 0;
  const bagA = Array.from( A.a.intersection(B.a) );
  const bagD = Array.from( A.d.intersection(B.d) );
  const bagG = Array.from( A.g.intersection(B.g) );
  B.why = [bagA, bagD, bagG];
  const l = bagA.length;
  bagA.forEach(function(actor, i) {
    n += 10 * (l-i)/l;
  });
  n += 10 * bagD.length;
  n +=      bagG.length;
  return n;
}



/*readCatalog(function(err, o) {
  if (err) { throw err; }
  const s = new Set(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
  o.forEach(function(a) {
    //if (a.title.toLowerCase().indexOf('lego') !== -1) {
    //  console.log(a.title, a.id);
    //}
    s.add(a.assetType);
    //console.log(a.title);
  });
  console.log( Array.from(s) );
});*/



/*updateAsset('0ed1d6ef-8378-4472-a6db-501faffd3e89', function(err, a) {
  if (err) { throw err; }
  // title
  // actors[].name/id
  // directors[].name/id
  // ratings[].title/id
  // genres[].label/id
  // duration (nr)
  // year (nr)
  // lastUpdateDate (date)
  // catalogSection - Movies Entertainment
  // assetType - Programme Boxset
  console.log(a);
});*/

/*updateAllAssets(function(err) {
  console.log(err || 'OK!');
});*/

function pluralize(word, n) {
  return word + (n !== 1 ? 's' : '');
}

function joinWords(arr) {
  arr = arr.slice();
  const last = arr.pop();
  return (arr.length > 0) ? `${arr.join(', ')} and ${last}` : last;
}

function getSuggestionReason(value) {
  const arr = [];
  if (value.actors.length > 0) {
    arr.push( joinWords(value.actors) + ' also starred' );
  }
  if (value.directors.length > 0) {
    arr.push( joinWords(value.directors) + ' also directed' );
  }
  if (value.genres.length > 0) {
    arr.push( 'has similar ' + pluralize('genre', value.genres.length) );
  }
  return joinWords(arr);
}


function run(cb) {
  readAllAssets(function(err, o) {
    if (err) { return cb(null); }

    function suggest(assetId, topN, cb) { // 'd6bd31cd-e0a3-4372-9c49-d52d1f83554e', 10
      const results = applyHeuristic(o, assetId, h1, topN);
      //console.log(results);
      const ids = results.map(function(r) { return r.i; });
      async.mapLimit(
        ids, // coll
        8, // limit
        readAsset, // iteratee
        function(err, assets) {
          if (err) { return cb(null); }

          const results2 = assets.map(function(a, idx) {
            const result = results[idx];
            // console.log(result);
            const value = {
              actors    : result.w[0].map(function(aId) { return _.find(a.actors, function(actor) { return actor.id === aId; }).name }),
              directors : result.w[1].map(function(aId) { return _.find(a.directors, function(actor) { return actor.id === aId; }).name }),
              genres    : result.w[2].map(function(aId) { return _.find(a.genres, function(actor) { return actor.id === aId; }).label })
            };
            return {
              reason: getSuggestionReason(value),
              value: value,
              asset: a
            };
          });

          cb(null, results2);
        }
      );
    }

    function autocomplete(needle, top, cb) {
      setTimeout(function() {
        cb(null, [needle, needle])
      }, 100);
    }

    cb(
      null,
      {
        suggest      : suggest,
        autocomplete : autocomplete
      }
    );
  });
}



function rip(cb) {
  updateCatalog(function(err, assets) {
    if (err) { return cb(err); }
    updateAllAssets(assets, cb);
  });
}



module.exports = {
  run : run,
  rip : rip
};
