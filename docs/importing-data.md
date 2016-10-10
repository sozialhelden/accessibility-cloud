# Converting source-data into common ac-data

## Stream Chain elements
We make data-import as flexible as possible, we seperate the process into small steps that are linked together through pipes. 

### HTTPDownload
Download any data from an URL.

### ReadFile
TBD

### ConvertToUTF8
Convert downloaded data into UTF8 (the format of the database). [Incomming formats](https://github.com/bnoordhuis/node-iconv) can be things like `ASCII`, `utf16`, `ISO-8859-1`.

### Split
Split the incoming streams into chunks.

Parameters:

### ParseJSONStream
Find and convert JSON-Objects within the incoming text-buffer into a data-object.

### ParseJSONChunks
Convert the incoming text-buffer from a single JSON-Object into an object. This can be useful if the stream is includes JSON-objects that are not seperated by commas.

### ParseCSVStream
Convert to a line of CSV into an object. [ReadMore]()

Parameters:
- 'header': true.


### ConsoleOutput
### TransformData
### UpsertPlace

## Defining mappings



## A sample stream-chain definition

```
[
    {
        "type": "HTTPDownload",
        "parameters": {
            "sourceUrl": "http://localhost:3000/data/wheelmap-pois-YNL-2016-08-10.json"
        }
    },
    {
        "type": "ConvertToUTF8",
        "parameters": {
            "fromCharSet": "utf8"
        }
    },
    {
        "type": "Split",
        "parameters": {
            "string": "\n"
        }
    },
    {
        "type": "ParseJSONChunks",
        "parameters": {
            "path": "*",
            "length": "totalFeatures"
        }
    },
    {
        "type": "TransformData",
        "parameters": {
            "mappings": {
                "originalId": "''+row.id",
                "geometry": "{ type: 'Point', coordinates: [Number(row['lon']), Number(row['lat'])] }",
                "name": "helpers.OSM.fetchNameFromTags(row.tags)",
                "tags": "row.tags",
                "isAccessible": "row.tags['wheelchair'] == 'yes'"
            }
        }
    },
    {
        "type": "UpsertPlace",
        "parameters": {}
    }
]
```


## Helper functions
Converting complex data is very complex. That's why we included a number of helper functions and libraries.

### Implemented

#### `helpers.OSM.fetchCategoryFromTags`

#### `helpers.OSM.fetchNameFromTags`

#### _ (underscore)

```
"data.accessibility.withWheelchair": "_.includes(row.tags['wheelchair'], 'yes','may','toms said so')"
```

