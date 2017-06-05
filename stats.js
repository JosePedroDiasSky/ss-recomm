'use strict';

const fs = require('fs');

const index = require('./index');
const CACHE_DIR = index.CACHE_DIR;
const readAllAssetsFull = index.readAllAssetsFull;



function tf(o) {
  return o ? 'T' : 'F';
}



const hasTrailer = new Set();
const hasSubtitles = new Set();
const hasMultipleSubtitles = new Set();
const hasMultipleAudio = new Set();



function visitForFeatures(ass) {
  const hasTr = ('trailers' in ass);

  let audios = new Set();
  let subs = new Set();
  if ('offers' in ass) {
    ass.offers.forEach(function(o) {
      const o2 = o.videoOptions.options;
      if ('audios' in o2) {
        o2.audios.forEach(function(au) { audios.add(au.name) });
      }
      if ('subtitles' in o2) {
        o2.subtitles.forEach(function(su) { subs.add(su.name) });
      }
    });
  }

  audios = Array.from( audios.keys() );
  subs = Array.from( subs.keys() );

  const hasMAudios = audios.length > 1;
  const hasMSubs = subs.length > 1;
  const hasSubs = subs.length > 0;

  console.log(`title       : "${ass.title}" (${ass.id})
trailer     : ${tf(hasTr)}
mult audios : ${tf(hasMAudios)} ${audios.join(',')}
subtitles   : ${tf(hasSubs)} ${subs.join(',')}
--------`);

  if (hasTr) {      hasTrailer.add(           ass.id ); }
  if (hasSubs) {    hasSubtitles.add(         ass.id ); }
  if (hasMSubs) {   hasMultipleSubtitles.add( ass.id ); }
  if (hasMAudios) { hasMultipleAudio.add(     ass.id ); }
}



readAllAssetsFull(function(err, assetsFullArr) {
    if (err) { return cb(null); }

    assetsFullArr.forEach(visitForFeatures);

    const xt = Array.from( hasTrailer.keys() );
    fs.writeFileSync(CACHE_DIR + '/trailer.json', JSON.stringify(xt, null, 2) );

    const xs = Array.from( hasSubtitles.keys() );
    fs.writeFileSync(CACHE_DIR + '/subtitles.json', JSON.stringify(xs, null, 2) );

    const xms = Array.from( hasMultipleSubtitles.keys() );
    fs.writeFileSync(CACHE_DIR + '/multiple-subtitles.json', JSON.stringify(xms, null, 2) );

    const xma = Array.from( hasMultipleAudio.keys() );
    fs.writeFileSync(CACHE_DIR + '/multiple-audio.json', JSON.stringify(xma, null, 2) );

    console.log(`
      # assets             : ${assetsFullArr.length}
      # w/ trailer         : ${xt.length}
      # w/ subtitles       : ${xs.length}
      # w/ mult. subtitles : ${xms.length}
      # w/ mult. audio     : ${xma.length}
    `);
  });