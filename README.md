# Accessibility Cloud

A global collection of accessibility data sources, open and free to use. Join, download and contribute. We're just getting started.

This repository is a collection of references to accessibility data sources.  This project is inspired by openaddresses.io

- See [accessibility.cloud](http://accessibility.cloud/) for a data download. 

## Contributing accessibility data sources

TDB.

- More details in [CONTRIBUTING.md](CONTRIBUTING.md).

## Why collect Accessibility Data?

We are confident that Accessibility Cloud will be a major step toward drastically increasing the distribution, quality and relevance of accessibility information. Through its open architecture and democratic setup, it will bridge the gap between different communities, drive communication, documentation and last but not least raise awareness. Because, in the end our goal is not to develop a sophisticated technical solution for documenting inaccessibility, but to make our society more accessible.


## License

TBD


## Adding / Contributing new sources

also see [Contributing](CONTRIBUTE.md)



Source-Json-Format
-------------
- You can use the following template

1. Create a new folder with the country and region
2. Select a title for the source
3. remove special characters from the filename
4. check the source url
  - paste it into a browser and check if download works
  - 

{
	"coverage": {
		"country": "us",		
		"region": "nc",
	},
	"data": "https://dl.dropboxusercontent.com/u/5503063/accessibility-cloud-data/US/Foursquare_WheelMap_Venues_5.26.16.csv",
	"contributor" : {
		"name": "Foursquare",
		"logo-url":"",
		"contributor-level":"featured",
		"url":"http://",
	},
	"license": {
		"contact-email": "holger.dieterich@sozialhelden.de",
		"comment":"this is an internal test data set",
	    "url": "",
	    "requires-share-alike": false
	},

	"type": "csv",
	"year": "2016",

	"conversion": {
		"converter": "csv2accsv",
		"parameters": {
		   "separator": ";",
		   "lon": "LONG", 
		   "lat": "LAT",    // ...  und viele mappings mehr
		   "street": ["HAUSNRZAHL1", "HAUSNRBUCHSTABE1"],
		 },
	}
}


Attributes
--------------
data-contributed-by:
data-contributed-url:

CSV
----








