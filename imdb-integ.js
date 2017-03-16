'use strict';

const imdb = require('imdb-api'); // only does movies, not people

imdb.getReq({name:'The Matrix'})
.then(function(r) {
	console.log('title', r.title);
	console.log('rating', r.rating);
	console.log('votes', r.votes);
	console.log('rated', r.rated);
	console.log('genres', r.genres);
	console.log('metascore', r.metascore);
	//console.log(r);
})
.catch(function(err) {
	console.error(err);
});
