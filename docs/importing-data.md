# Converting source-data into the accessibility.cloud format

This document should give you a general idea how to import data into the accessibility.cloud format.

If you know how to import data already and just need a reference of the whole exchange format's schema, [go here](./exchange-format.md).

Data sources are currently defined using a JSON string. To make importing data as flexible and efficient as possible, we separate the process into small processing modules that are linked together through stream pipes. Each module's functionality is customizable using a set of parameters. If you have an API, you don't have to change it to make it compatible to accessibility.cloud.

Here is an exemplary import process definition to download and process JSON data from a web API:

```json
[
    {
        "type": "HTTPDownload",
        "parameters": {
            "sourceUrl": "https://example.com/data/example-pois-YNL-2016-08-10.json"
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

## Stream Chain elements

Currently, we support the following stream modules:

### `HTTPDownload`
Downloads any data from an URL.

### `ConvertToUTF8`
Converts downloaded data into UTF8 (the format of the database). [Input formats](https://github.com/bnoordhuis/node-iconv) can be things like `ASCII`, `utf16`, `ISO-8859-1`.

### `Split`
Splits the incoming string into chunks that can be processed as objects, using a given delimiter.

### `ParseJSONStream`
Reads one single JSON string as a stream, scraping all JSON objects or values matching a given path and returning them as JavaScript objects.

### `ParseJSONChunks`
Reads multiple JSON strings (each representing one JSON object) and converts the incoming text buffers into JavaScript objects. This can be useful for the common case that the input data consists of multiple JSON objects delimited by newlines (or other characters).

### `ParseCSVStream`
Parses a CSV stream and outputs JSON strings for each line, optionally reading the header and using it for the property names. We use the [FastCSV](https://www.npmjs.com/package/fast-csv) module for this. Note that you currently have to use ParseJSONChunks after this module to convert the JSON strings into actual JavaScript objects before further processing.

#### Parameters
`"objectMode" = true`: Ensure that data events have an object emitted rather than the stringified version set to false to have a stringified buffer.
`"headers" = false`: Set to true if you expect the first line of your CSV to contain headers, alternatly you can specify an array of headers to use. You can also specify a sparse array to omit some of the columns.
`"ignoreEmpty" = false`: If you wish to ignore empty rows.
`"delimiter" = ","`: If your data uses an alternate delimiter such as ; or \t.

### `TransformData`
Transforms given JSON objects into the [accessibility.cloud format](./exchange-format.md) using mappings and JavaScript.

#### Defining mappings

You can use JavaScript functions to convert from your original data into the final format. Note that each POI you import should at least have these properties:
- `geometry` — so your POIs can be found in location-based search queries to accessibility.cloud. This property follows the [GeoJSON](http://geojson.org/geojson-spec.html) standard specification. It's best to supply a `Point` here, but other geometry types are supported as well. If your API just has longitude and latitude, you have to convert this data into a GeoJSON point structure (see below for an example)
- `properties-name` — The name of the imported place.
- `properties-originalId` — to overwrite existing POIs on re-import. This should be an ID string based on your own API's unique POI identifier attribute.
- `properties-accessibility-accessibleWith-wheelchair` — a Boolean value that is used to mark the POI as accessible with a wheelchair in queries.
- `properties-accessibility-accessibleWith-guideDog` — a Boolean value that is used to mark the POI as accessible with a guide dog in queries.
- `properties-accessibility-accessibleWith-limitedSight` — a Boolean value that is used to mark the POI as accessible with a limited sight in queries.

Note that for properties, you can use key paths to generate nested objects. Path portions are split with `-` dashes. If a portion of path doesn't exist, it's created. A path portion can be numeric, in this case the child is regarded as an array. Arrays are created for missing index properties while objects are created for all other missing properties.

Here is an example:

```
"mappings": {
    "geometry": "{ type: 'Point', coordinates: [Number(row['lon']), Number(row['lat'])] }",
    "properties-originalId": "''+row.id",
    "properties-name": "helpers.OSM.fetchNameFromTags(row.tags)",
    "properties-accessibility-accessibleWith-wheelchair": "row.tags['wheelchair'] == 'yes'"
}
```

### `UpsertPlace`

Inserts an object into the database as place. The place will be associated with the source you have created in the accessibility.cloud web UI and will be available over the API users as soon as

- you have accepted the terms and conditions for the organization under whose name the data source is published
- your data source is not in draft state anymore (see the source's 'Settings' tab in the web UI)
- the app token that is used to query the API belongs to an app by an organization that is allowed to read your source's data (you can either allow everyone or specific organizations to use your data source in the 'Settings' tab).



## Helper functions
Converting complex data is—you guessed right—complex :) That's why we included a number of helper functions and libraries.

### Implemented

#### `helpers.OSM.fetchCategoryFromTags`

#### `helpers.OSM.fetchNameFromTags`

#### _ (underscore)

```
"data.accessibility.withWheelchair": "_.includes(row.tags['wheelchair'], 'yes','may','toms said so')"
```

