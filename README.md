# summary

## setup

    npm install


## validate/change store-env pair

* edit `CFG` and `CACHE_DIR` constants in `index.js`

* create/edit relevant `config-<store>-<env>.json` file



## rip data

    node rip.js

it stores the data into `CACHE_DIR` directory



## stats usage

    node stats.js


three additional files besides the catalog asset responses get saved into the `CACHE_DIR` dir:

    trailer.json
    subtitles.json
    multiple-audio.json


one can also save the stdout:

    node stats > summary.txt


## API usage

    node serve.js

visit <http://127.0.0.1:3000/suggest/d6bd31cd-e0a3-4372-9c49-d52d1f83554e> (assetId of The Matrix movie)

visit <https://stage.sl.pt/suggest/d6bd31cd-e0a3-4372-9c49-d52d1f83554e>


# Resources

* <https://github.com/worr/node-imdb-api>
* <https://github.com/NaturalNode/natural>
* <https://www.npmjs.com/package/auto-sni>
*  <http://ac.els-cdn.com/S0888613X10000460/1-s2.0-S0888613X10000460-main.pdf?_tid=f6f02252-09a7-11e7-922a-00000aab0f26&acdnat=1489600446_dbe9e879a875f4af7c44bd287eedc15d>
