# How to import data

This document should give you a general idea how to import data into the accessibility.cloud format.

If you know how to import data already and just need a reference of the whole exchange format's schema, [go here](./exchange-format.md).

## Getting started

Nobody should have to change their data format to import it as accessibility.cloud source, so to make the import flow as flexible and efficient as possible, we separate the process into small, customizable processing units that are linked together in a data flow.

Here is an exemplary import flow definition to download and process GeoJSON data from a web API. Currently you have to write import processes in JSON, but we plan to have a UI for this soon.

You can start by copy & pasting this definition into the text area in the 'Format' tab of your source and click the 'Start an import' button to download and process the data. Each object in the array corresponds to one stream processing unit (see below for an explanation what that means):

```javascript
[
    {
        "type": "HTTPDownload",
        "comment": "Downloads public toilet data from Vienna's open data website as JSON.",
        "parameters": {
            "sourceUrl": "http://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:WCANLAGEOGD&srsName=EPSG:4326&outputFormat=json"
        }
    },
    {
        "type": "ParseJSONStream",
        "comment": "Extract all GeoJSON features from the JSON.",
        "parameters": {
            "path": "features.*",
            "lengthPath": "totalFeatures"
        }
    },
    {
        "type": "DebugLog",
        "comment": "Output the extracted data for inspecting."
    },
    {
        "type": "TransformData",
        "comment": "Transform the data into accessibility.cloud format.",
        "parameters": {
            "mappings": {
                "properties-originalId": "d.id",
                "properties-category": "'toilets'",
                "properties-name": "'Public Toilet'",
                "geometry": "d.geometry",
                "properties-address": "d.properties['STRASSE'] + ', Bezirk ' + d.properties['BEZIRK'] + ', Vienna, Austria'",
                "properties-accessibility-accessibleWith-wheelchair": "d.properties['KATEGORIE'].includes('Behindertenkabine')"
            }
        }
    },
    {
        "type": "DebugLog",
        "skip": true
    },
    {
        "type": "UpsertPlace",
        "comment": "Save each transformed data record in the database."
    }
]
```

## Stream processing units

Stream processing units have inputs and outputs. They transform chunks of binary data or JavaScript objects into new chunks of binary data or JavaScript objects.

Each unit's JSON object definition has the following properties:

- `type`: Type of the stream unit, as String, for instance `"DebugLog"` (all unit types are explained below).
- `comment` (optional): Shown in the import results. This is useful for explaining others how your stream chain works. Shown in the results on import.
- `parameters` (optional): Allows to supply parameters to the unit that specify how it is supposed to work.
- `skip` (optional): Connect output of the previous unit to the following unit of this stream unit, skipping this unit. Helpful for debugging or drafting stream chains.

Currently, we support the following stream processing units:

### `ConvertArrayToStream`

Reads Array objects on the input, takes their elements and outputs them as single objects.

### `ConvertToUTF8`

Converts downloaded data into UTF8 (the format of the database). [Input formats](https://github.com/bnoordhuis/node-iconv) can be things like `ASCII`, `utf16`, `ISO-8859-1`.

#### Parameters

- `fromCharset`: name of the character set used on the input.

### `DebugLog`

Displays the first and the last chunk read from input in the UI.

### `HTTPDownload`

Starts a single HTTP GET request to downloads data from a given URL.

#### Parameters

- `sourceUrl`: URL that should be used. Should start with `http` or `https`.
- `gzip`: Boolean to switch gzip/deflate support on or off. `true` by default.
- `header`: Additional headers for the request, as object.

### `Limit`

Reads chunks and outputs them without changing them. Stops output after given number of chunks.

#### Parameters

- `limit`: Maximal number of output chunks (Default: `3`)

### `MultiHTTPDownload`

Starts parallel HTTP GET requests for each input chunk. The URL is generated from the input data.

#### Parameters

- `sourceUrl`: URL from which the data should be downloaded. Should start with `http` or `https`. If you insert the string `{{inputData}}` into the URL, it is replaced with the chunk that is read from the input.
- `maximalErrorRatio`: If you make many requests to an API, it can be a normal case that some of them fail without making the whole result invalid, for example if the source's underlying database contains invalid records. Use this parameter to specify how many percent of the currently obtained responses can have an error before the whole stream's result is regarded as erroneous. When the threshold is reached, the stream stops processing any further input. Note that if the ratio is less than 1.0 and the first response contains an error, the stream fails. Default is `0.25` (= 25%).
- `gzip`: Boolean to switch gzip/deflate support on or off. `true` by default.
- `header`: Additional headers for the request, as object.
- `allowedStatusCodes`: Array of [HTTP status code numbers](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) that are regarded as successful. Default is `[200]`.
- `maximalConcurrency`: Specifies how many requests can be made to the server at the same time. When the maximum is reached, the stream pauses reading from the previous stream unit. Default is `3`.

### `ParseCSVStream`

Parses a CSV stream and outputs JSON strings for each line, optionally reading the header and using it for the property names. We use the [FastCSV](https://www.npmjs.com/package/fast-csv) module for this. Note that you currently have to use ParseJSONChunks after this module to convert the JSON strings into actual JavaScript objects before further processing.

An example block looks like this....

```
    {
        "type": "ParseCSVStream",
        "parameters": {
            "headers": true,
            "objectMode": true
        }
    },
```

#### Parameters

- `objectMode`: Ensure that data events have an object emitted rather than the stringified version set to false to have a stringified buffer (Default: `true`)
- `headers`: Set to true if you expect the first line of your CSV to contain headers, alternatly you can specify an array of headers to use. You can also specify a sparse array to omit some of the columns. (Default: `false`)
- `ignoreEmpty`: If you wish to ignore empty rows (Default: `false`)
- `delimiter`: If your data uses an alternate delimiter such as `";"` or `"\t"`. (Default: `","`)

### `ParseJSONChunks`

Reads each incoming chunk as JSON string and converts it to a JavaScript objects. This can be useful for the common case that the input data consists of multiple JSON strings delimited by newlines (or other characters).

### `ParseJSONStream`

Reads one single JSON string as a stream, scraping all JSON objects or values matching a given `path` parameter and returning them as JavaScript objects.

#### Parameters

- `path`: Path of the resulting objects given in [JSONPath format](http://goessner.net/articles/JsonPath/), for instance `features.*.properties`. To parse the JSON, we use the [JSONStream library](https://github.com/dominictarr/JSONStream#jsonstreamparsepath).

### `Skip`

Skips a given number of input chunks, then outputs the rest without changes.

#### Parameters

- `skip`: Number of chunks to skip (Default: `0`)

### `Split`

Splits the incoming string into chunks that can be processed as objects, using a given delimiter.

### `TransformData`

Transforms given JSON objects into the [accessibility.cloud format](./exchange-format.md) using mappings and JavaScript.

#### Parameters

- `ignoreSkippedPlaces`: If `true`, places without original id are not regarded as errors. If `false` (default), the import will be marked as erroneous when a place without original id is encountered.
- `mappings`: A JSON object that contains mappings. Keys are target property names according to the accessibility.cloud specification, values are JavaScript expression strings. Inside the expression, you can access the input data record using the predefined JavaScript variable `d`. ES6 is supported.

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

```json
{
"mappings": {
    "geometry": "{ type: 'Point', coordinates: [Number(d['lon']), Number(d['lat'])] }",
    "properties-originalId": "''+d.id",
    "properties-name": "helpers.OSM.fetchNameFromTags(d.tags)",
    "properties-accessibility-accessibleWith-wheelchair": "d.tags['wheelchair'] == 'yes'"
  }
}
```

### `TransformScript`

Transforms each input chunk or object into something else, using a JavaScript expression.

#### Parameters

- `javascript`: JavaScript expression like `Array.from({length: d}, (v, k) => k + 1)`. Supports ES6. `d` is predefined as the input data. The expression is evaluated and its result is written as new chunk/object to the output.

### `UpsertPlace`

Inserts an object into the database as place. The place will be associated with the source you have created in the accessibility.cloud web UI and will be available over the API users as soon as

- you have accepted the terms and conditions for the organization under whose name the data source is published
- your data source is not in draft state anymore (see the source's 'Settings' tab in the web UI)
- the app token that is used to query the API belongs to an app by an organization that is allowed to read your source's data (you can either allow everyone or specific organizations to use your data source in the 'Settings' tab).


This is usually the last unit in the stream chain.


## Helper functions
Converting complex data is—you guessed right—complex :) That's why we included a number of helper functions and libraries.

### Implemented

#### `helpers.OSM.fetchCategoryFromTags`

#### `helpers.OSM.fetchNameFromTags`

#### _ (underscore)

```
"data.accessibility.withWheelchair": "_.includes(row.tags['wheelchair'], 'yes','may','toms said so')"
```
