
/*************  Load Dependencies  ***************/
var request = require('request'), 
	Spotify = require('node-spotify-api'),
	Twitter = require('twitter'),
	fs = require('fs'),
	keys = require('./keys.js');

/*************  Liri Class  ***************/
function StartLiri(input){
	if (input.length === 0){		
		//if no input, load default/demo file								
		readFile('./random.txt', (defaults)=>{	
			//loop through commands and run them					
			for(let item of defaults)								
				doStuff(item.q, item.t);
		});
	} else{
		//log commands to log.txt
		fs.appendFile('log.txt', `\r\n${input.join(' ')}`, 			
			(err)=>{if(err)console.log(err);});

		//send query and arguements to doStuff()
		doStuff(input[0], input.splice(1, input.length-1).join(' '));											
	}
}

/*************  Read File Function  ***************/
function readFile(file, callback){
	//read file and send data to callback function
	fs.readFile(file, 'utf8', function(error, data){
		if (error){
			console.log('Error reading file.');
			return;
		}
		return callback(JSON.parse(data));
	});
}

/*************  Analyze Query and Execute It  ***************/
function doStuff(queryType, queryText){
	//figure out the type of query and act with the queryText
	switch (queryType){
		case 'spotify-this-song':
			//instantiate spotify object with private keys
			var spotify = new Spotify({id:keys.spotifyKeys.client_id, secret:keys.spotifyKeys.client_secret});
			//use Ace of Base if no text was given
			queryText = queryText||"Ace of Base";
			//make spotify API call and show result on console 
			spotify.search({type:'track', query:queryText, limit:1})
			.then((data)=>{
				let track = data.tracks.items[0];
				if(track){
					console.log(`\t==========Music Info==========\nTrack:\t${track.name}\nArtist:\t${track.artists[0].name}\nAlbum:\t${track.album.name}\nSample:\t${track.preview_url}\n\t====================\n`);
				}
				else {
					console.log(`\t====================\nSorry, I couldn't find that song.`);
				}
			})
			.catch((error)=>{
				console.log(error);
			});
			break;
		case 'movie-this':
			//use Mr Nobody as queryText if no input was given 
			queryText = queryText||"Mr. Nobody";
			let url = `http://www.omdbapi.com/?t=${queryText}&y=&plot=short&apikey=${keys.omdbKeys.api_key}`;
			//make OMDB API call and show result/error on console 
			request(url, (error, code, data)=>{
				if(error){
					console.log(`Error: ${error}`);
					return;
					}
				data = JSON.parse(data);
				if (data.Response === 'True'){
					let imdbRating = (data.Ratings.length > 0) ? data.Ratings[0].Value:'Not yet rated.';
					console.log(`\t==========Movie Info==========\nTitle:\t\t ${data.Title}\nYear:\t\t ${data.Year}\nIMDB Rating:\t ${imdbRating}\nCountry:\t ${data.Country}\nLanguage:\t ${data.Language}\nPlot:\t\t ${data.Plot}\nActors:\t\t ${data.Actors}\nRotten Link:\t https://www.rottentomatoes.com/search/?search=${data.Title}\n\t====================\n`);
				} else {
					console.log(`\t====================\nSorry, I couldn't find that movie.`);
				}

			});
			break;
		case 'my-tweets':
			//use jcthomas00 as queryText if no input was given 
			queryText = queryText||'jcthomas00';
			//create twitter object with credentials
			let client = new Twitter({
				consumer_key: keys.twitterKeys.consumer_key,
				consumer_secret: keys.twitterKeys.consumer_secret,
				access_token_key: keys.twitterKeys.access_token,
				access_token_secret: keys.twitterKeys.access_secret
			})
			//get the last 20 tweets of user in queryText
			client.get('statuses/user_timeline',{screen_name:queryText, count:20})
			.then((data)=>{
				console.log('\t==========Recent Tweets==========\n');
				let i = 0;
				//loop thru response and show text on screen
				for(let tweets of data)
					console.log(`${++i}:\t${tweets.text}`);
				console.log('\t====================\n');
			})
			.catch((error)=>{
				console.log(`\t====================\nSorry, I couldn't find that twitter user.`);
			});
			break;
		default:
			//invalid query - error out
			console.log('Sorry, I did not understand you');
			return;
	}
}

/*************  Run Liri  ***************/
new StartLiri(process.argv.splice(2, process.argv.length-2));