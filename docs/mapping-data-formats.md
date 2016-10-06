# Converting source-data into common ac-data


## 


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

## Defining mappings











# Required primary data for the AC api

## Intermediate format for active development

```
{
  "_id": "ttikRCM5Sz2v2m3cZ",
  "sourceId": "BwEuneiKbLGJyEeDE",
  "lastSourceImportId": "R7tbPmwn8Jbhi54rM",

  "data": {
    "providedId": "234234",
    "name": "Hotel Adlon",
    "accessible": 0.2000000000000000111
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      -123.13700000000000045,
      49.251339999999999009
    ]
  }
}

```

## Proposed format longterm format

### General questions


### Suggested changes
- `data.accessibility.wheelchair.entry: 0.2`
- `data.accessibility.wheelchair.restrooms: 0.2`

### Needs discussion
- `data.licenseDetails: https://accessibility.cloud/sources/23423234`
- `data.placeDetails: 

