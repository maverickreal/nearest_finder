const https=require('https');

const terminate = err =>{
	if(err!==null){
		console.log('Exception:\n', err);
	}
	process.exit();
}

const getRadians = angle => (angle * Math.PI) / 180;

const getHaversine = (lat1, lon1, lat2, lon2) => { // computes the dist between (lat1,lon1) & (lat2,lon2) 
  const dLat = getRadians(lat2 - lat1), dLon = getRadians(lon2 - lon1),
  a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(getRadians(lat1)) * Math.cos(getRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
  ans = c * 6371; // The Earth's radius.
  return ans;
};

const getNearest = arr =>{
	let nearestCoord= arr[1], mnDist = getHaversine(arr[0].lat, arr[0].long, arr[1].lat, arr[1].long);
	for (let i = 2; i < arr.length; i++) {
	  const curDist = getHaversine(arr[0].lat, arr[0].long, arr[i].lat, arr[i].long);
	  if (curDist < mnDist) {
	    nearestCoord = arr[i];
	    mnDist=curDist;
	  }
	}
	console.log('Using the geo-coordinates:\n');
	for(const gc of arr){
		console.log(gc);
	}
	console.log(`The nearest location to (${arr[0].lat}, ${arr[0].long}) is (${nearestCoord.lat}, ${nearestCoord.long}), located at a distance of ${mnDist}.`);
}

const main = async cnt => {
	if(cnt<2){
		terminate('invalid cnt');
	}
	const arr=[];
	let done=0;
	for(let i=0;i<cnt;++i){
		try{
			/* Better use an API that returns an array,
			or some approach that minimizes the networking */
			https.get('https://api.3geonames.org/?randomland=yes&json=1', res => {
					let data='';
					res.on('data', chunk => data+=chunk);
					res.on('close', ()=>{
						data=JSON.parse(data);
						arr.push({lat:data.nearest.inlatt, long:data.nearest.inlongt});
						if(++done==cnt){
							getNearest(arr);
							terminate(null);
						}
					});
				});
		}
		catch(err){
			terminate(err);
		}
	}
}

process.stdin.on('data', data => main(data));