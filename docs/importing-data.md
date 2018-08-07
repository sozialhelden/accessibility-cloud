# How to import data

This document should give you a general idea how to import data like places, equipment/facility infos and disruptions into the accessibility.cloud format.

If you know how to import data already and need a reference of the whole exchange format's schema, [go here](./exchange-format.md).

## Getting started

Nobody should have to change their data format to import it as accessibility.cloud source, so to make the import flow as flexible and efficient as possible, we separate the process into small, customizable processing units that you can link together in a data flow.

Here is an exemplary import flow definition to download and process GeoJSON data from a web API. Currently you have to write import processes in JSON, but we plan to have a UI for this.

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

- `type`: Stream unit type, as `String`, for instance `"DebugLog"` (all unit types are
  explained below).
- `comment` (optional): Shown in the import results. This is useful for explaining others how your
  stream chain works. Shown in the results on import.
- `parameters` (optional): Allows to supply parameters to the unit.
- `skip` (optional): Connect output of the previous unit to the following unit of this stream unit, skipping this unit. Helpful for debugging or drafting stream chains.

We support the following stream processing units:

### `ConvertArrayToStream`

Reads Array objects on the input, takes their elements and outputs them as single objects.

### `ConvertToUTF8`

Converts downloaded data into UTF8 (the format of the database). [Input formats](https://github.com/bnoordhuis/node-iconv) can be strings like `ASCII`, `utf16`, `ISO-8859-1`.

#### Parameters

- `fromCharset`: name of the character set used on the input.

### `DebugLog`

Displays the first and the last chunk read from input in the UI.

### `HTTPDownload`

Starts a single HTTP GET request to downloads data from a given URL.

#### Parameters

- `sourceUrl`: URL from which the data should be downloaded. Should start with `http` or `https`.
- `gzip`: Boolean to switch gzip/deflate support on or off. `true` by default.
- `header`: headers to send with the request, as plain JS object.

### `Limit`

Reads chunks and outputs them without changing them. Stops output after given number of chunks.

#### Parameters

- `limit`: Maximal number of output chunks (Default: `3`)

### `MultiHTTPDownload`

Pipe a stream of multiple strings into this unit to generate parallel HTTP requests. Starts parallel HTTP GET requests for each input chunk. The stream unit generates the URL for each request from each input data chunk.

#### Parameters

- `sourceUrl`: URL to download the data from. Should start with `http` or `https`. If you insert the string `{{inputData}}` into the URL, the unit replaces it with what it reads from the input.
- `maximalErrorRatio`: If you make a lot of requests to an API, it can be a normal case that some of them fail without making the whole result invalid, for example if the source's underlying database contains invalid records. Use this parameter to specify the ratio between erroneous and valid obtained responses before you regard the whole stream's result as erroneous. When reaching the threshold, the stream stops processing. Note that if the ratio is less than 1.0 and the first response contains an error, the stream fails. Default is `0.25` (= 25%).
- `gzip`: Boolean to switch gzip/deflate support on or off. `true` by default.
- `header`: Additional headers for the request, as object.
- `allowedStatusCodes`: Array of [HTTP status code numbers](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) that you regard as successful. Default is `[200]`.
- `maximalConcurrency`: Specifies maximal number of parallel requests at the same time. When reaching this concurrency level, the stream pauses reading from the previous stream unit. Default is `3`.

### `ParseCSVStream`

Parses a CSV stream and outputs JSON strings for each line, optionally reading the header and using it for the property names. We use the [FastCSV](https://www.npmjs.com/package/fast-csv) module for this. Note that you have to use ParseJSONChunks after this module to convert the JSON strings into actual JavaScript objects before further processing.

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

- `ignoreSkippedPlaces`: If `true`, places without original id are not regarded as errors. If `false` (default), mark the import as erroneous when encountering a place without original id.
- `mappings`: A JSON object that contains mappings. Keys are target property names according to the accessibility.cloud specification, values are JavaScript expression strings. Inside the expression, you can access the input data record using the predefined JavaScript variable `d`. We support ES2015 here.

#### Defining mappings

You can use JavaScript functions to convert from your original data into the final format. Note that each POI you import should at least have these properties:
- `geometry` — so accessibility.cloud returns our POIs in location-based search queries. This property follows the [GeoJSON](http://geojson.org/geojson-spec.html) standard specification. It's best to supply a `Point` here, but we support other geometry types as well. If your API supplies a WGS84 longitude and latitude as single fields, you have to convert the coordinates to a GeoJSON point structure (see below for an example)
- `properties-name` — The name of the imported place.
- `properties-originalId` — to overwrite existing POIs on re-import. This should be an ID string based on your own API's unique POI identifier attribute.
- `properties-accessibility-accessibleWith-wheelchair` — a Boolean value to mark the POI as accessible with a wheelchair in queries.
- `properties-accessibility-accessibleWith-guideDog` — a Boolean value to mark the POI as accessible with a guide dog in queries.
- `properties-accessibility-accessibleWith-limitedSight` — a Boolean value to mark the POI as accessible with a limited sight in queries.

Note that for properties, you can use key paths to generate nested objects. Path portions are split with `-` dashes. If a part of path doesn't exist, it's created. A path portion can be numeric, in this case we regard the child as an array. The transform step creates arrays for missing index properties while creating objects for all other missing properties.

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

- `javascript`: JavaScript expression like `Array.from({length: d}, (v, k) => k + 1)`. Supports ES2015. `d` is predefined as the input chunk/object. Evaluates the expression and writes its result as new chunk/object to the output.

### `UpsertPlace`

Inserts an object into the database as place. Upserting will link the place with the source you have created in the accessibility.cloud web UI, and will make it available to API users when…

- you have accepted the terms and conditions for the data source's organization
- your data source is not in draft state anymore (see the source's 'Settings' tab in the web UI)
- the app token used to query the API belongs to an app by an organization that is allowed to read your source's data (you can either allow everyone or specific organizations to use your data source in the 'Settings' tab).

`UpsertPlace` is usually the last unit in the stream chain, but it outputs status data for each processed chunk that you can use for debugging.


### `UpsertEquipment`

Inserts a record into the database that describes an equipment or facility of a place, for example an elevator or escalator.

Note that equipment and facilities have a [differing set of accessibility attributes](https://github.com/sozialhelden/accessibility-cloud/blob/master/both/api/equipment-infos/equipment-infos.js).

This works like `UpsertPlace`, but using it marks the source as a data source for equipment/facilities, which enables special features:

- Equipment / Facility PoIs can belong to `PlaceInfo` PoIs from another data source. This way, places can have a list of (for example) elevators and escalators.
- If a transformed imported PoI has `properties.originalPlaceInfoId` and `properties.placeSourceId` properties, importing will associate the equipment/facility with the place. For this association, accessibility.cloud uses the data provider's original place ID.
- If the equipment data source uses a different ID space than the associated places, you can use the `properties.originalPlaceInfoIdField` property
- For this to work, `properties.placeSourceId` must refer to the ID of a place data source on accessibility.cloud that belongs to the same organization.
- accessibility.cloud will show the imported equipment/facilities on the overview page of associated place data source.
- The accessibility.cloud `/placeInfos` API will include equipment/facility data as `properties.equipmentInfos` property.


### `UpsertDisruption`

Inserts a record into the database that describes a (possibly timed) disruption of an equipment object.

This allows to record if a disruption is a planned event, scheduled maintainances, or to let users of the equipment find out when a disruption will end.

accessibility.cloud supports two models for storing disruptions:

1) A `PlaceInfo` has 0-* `EquipmentInfos`. `EquipmentInfo`s have many `Disruption`s.
2) A `PlaceInfo` has 0-* `Disruptions`, without a model for equipment/facility info.

Some data sources have one record per existing disruption and do not supply disruptions that have happened in the past or will happen in the future. For this, you can set the `removeMissingRecords` parameter of the `UpsertDisruption` stream unit to `true`. Setting the flag will delete all disruption records that have not been part of an import after the import finishes.

Note that disruptions have a [specific set of attributes](https://github.com/sozialhelden/accessibility-cloud/blob/master/both/api/disruptions/disruptions.js).

This works like `UpsertPlace`, but using it marks the source as a data source for disruptions, which enables special features:

- A disruption can belong to a `PlaceInfo` or `EquipmentInfo` from another data source. The same way, a place or equipment/facility can have a list of disruptions in the past, present and future. Depending on the imported data model, its your choice if you want to associate a disruption with a place or equipment/facility.
- If a transformed imported PoI has `properties.originalPlaceInfoId` and `properties.placeSourceId` properties, importing will associate the disruption with the place.
- If a transformed imported PoI has `properties.originalEquipmentInfoId` and `properties.equipmentSourceId` properties, importing will associate the disruption with the equipment/facility.
- For this to work, the equipment/facility/place data sources must belong to the same organization. Use the `properties.equipmentSourceId` and `properties.placeSourceId` properties to refer to the respective data sources.
- If you associate a disruption with equipment, you can use the `isEquipmentWorking` property of the disruption and set the stream unit's `takeOverEquipmentWorkingFlag` parameter to `true`. This will update the equipment's `properties.isWorking` flag on import. If you want to take the date properties of the `Disruption` into account, set the `properties.equipmentIsWorking` flag accordingly in the disruption data source transform stream.
- If you set `setUnreferencedEquipmentToWorking` to `true`, accessibility.cloud will interpret missing disruption information as working equipment and set all equipment infos not referenced in the last import to `isWorking: true` after import. The server can reset the `isWorking` flag on a specific subset of equipment if you add a `equipmentSelectorForImport` selector that selects the places that should be reset. An example where this is useful is when an equipment source has elevators from different operators, and you want the import to a affect a specific operator’s elevators only.
- accessibility.cloud will show the imported disruptions on the overview page of associated places/equipment/facility data sources.
- `/placeInfos` API responses will include disruption data if you supply a `includeRelated=equipmentInfos.disruptions` query parameter.
- `/equipmentInfos` API responses will include disruption data if you supply a `includeRelated=disruptions` query parameter.

## Convenience functions and libraries

You can use the following popular libraries for your transform code:

- [lodash](https://lodash.com), an extensive convenience function libary for JavaScript, via the global variable `_`
- [geodesy](https://github.com/chrisveness/geodesy), a libary of geodesy functions (for example conversions between coordinate systems), via the global variable `geodesy`

… and the following helpers:

- `helpers.OSM.fetchCategoryFromTags`: Find a valid accessibility.cloud category identifier from a given array of OpenStreetMap tags. Returns a `String`.
- `helpers.OSM.fetchNameFromTags`: Generate a generic name for a place from given array of OpenStreetMap tags. Returns a `String`.
- `helpers.extractNumber` to find and extract a number from a given string. Returns a `Number`.
- `helpers.convertOSGB36ToWGS84Point(x, y)` to convert OSGB36 X/Y geocoordinates to a GeoJSON Point geometry structure. Returns an object, for example like `{ type: 'Point', coordinates: [ -1.609014719024711, 54.97022522800059 ] } }`.
