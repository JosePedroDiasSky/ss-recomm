const CFG = require('./config.json');

const fs = require('fs');

const request = require('request'); // https://github.com/request/request
const async = require('async'); // http://caolan.github.io/async/ https://github.com/caolan/async



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



function updateAllAssets(cb) {
  readCatalog(function(err, assets) {
    if (err) { throw err; }
    const ids = assets.map(function(a) { return a.id; });
    async.eachLimit(
      ids, // coll
      8, // limit
      updateAsset, // iteratee
      cb
    );
  });
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
    a: new Set( o.actors    ? o.actors.map(_getId)    : [] ),
    d: new Set( o.directors ? o.directors.map(_getId) : [] ),
    g: new Set( o.genres    ? o.genres.map(_getId)    : [] )
  }
}



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
    arr.push({i:k, v:heuristicFn(a1, a2)});
  }
  arr.sort(_byV_);
  return arr.slice(0, topN);
}



// d6bd31cd-e0a3-4372-9c49-d52d1f83554e the matrix
// fcdef8e2-273f-446a-b934-9ccf0da07fa2 the matrix reloaded
// 77567476-81de-42b6-bf09-eb0e53e7f139 the matrix revolutions
function h1(A, B) {
  let n = 0;
  n += 10 * A.a.intersectionCount(B.a);
  n +=  6 * A.d.intersectionCount(B.d);
  n +=      A.g.intersectionCount(B.g);
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



console.log('loading...');
readAllAssets(function(err, o) {
  console.log('running...');

  /*const a1 = o.get('d6bd31cd-e0a3-4372-9c49-d52d1f83554e');
  const a2 = o.get('fcdef8e2-273f-446a-b934-9ccf0da07fa2');
  const v = h1(a1, a2);
  console.log(v);*/

  const results = applyHeuristic(o, 'd6bd31cd-e0a3-4372-9c49-d52d1f83554e', h1, 10);
  //console.log(results);
  const ids = results.map(function(r) { return r.i; });
  async.mapLimit(
    ids, // coll
    8, // limit
    readAsset, // iteratee
    function(err, assets) {
      if (err) { throw err; }
      assets.forEach(function(a, idx) {
        const result = results[idx];
        console.log('\n------- %sth v:%s id:%s', idx+1, result.v, result.i);
        console.log('TITLE: %s', a.title);
        console.log('ACTORS: %s', a.actors.map(_getName).join(', '));
        console.log('DIRECTORS: %s', a.directors.map(_getName).join(', '));
        console.log('GENRES: %s', a.genres.map(_getLabel).join(', '));
      });
    }
  );
});



module.exports = {
  readAllAssets: readAllAssets
};



/*
r = require('./index')
r.readAllAssets(function(err, o) { global.o = o; console.log('done'); })
*/
