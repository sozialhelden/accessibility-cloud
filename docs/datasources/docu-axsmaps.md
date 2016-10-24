# AXSMaps
Some notes on the API inport-format of axsmaps

## Formatted Sample Object

    {
      "_id": {
        "$oid": "4fa978ca3d17020100000025"
      },
      "bathroom": 2.2,
      "place_id": "ChIJO6_O_lxZwokRQ3c5GO6sTkE",
      "google_url": "https://plus.google.com/108166561315032013796/about?hl=en",
      "lngLat": [
        40.719417,
        -73.956245
      ],
      "spacious": 5,
      "name": "Soft Spot",
      "ramp": 0,
      "parking": 0,
      "types": [
        "night_club",
        "bar",
        "establishment"
      ],
      "entry": 3.5,
      "quiet": 2,
      "secondentrance": 1,
      "state": "NY",
      "city": ""
    }

## mapping





## Description of data format
There is a [extensive description](https://www.axsmap.com/faq/) on the AXSMaps page.

### `entry` 
Average community ratings on a scale from 0 (not) to 5 (totally), 0 is default for no review, 1-5 is actual rating

[Voting-documtion](https://www.axsmap.com/faq/) from the AXSMap documentation:

- 1 star – narrow, multiple steps to climb, no ramp available
- 2 stars – narrow, one step to climb, no ramp available
- 3 stars – portable ramp available, too steep or difficult to navigate
- 4 stars – wide entrance with steps, portable ramp available that is accessible
- 5 stars – wide entrance, no steps or has permanent ramp, easily accessible
Remember reviews are subjective. 


### `bathroom`
Average community ratings on a scale from 0 (not) to 5 (totally), 0 is default for no review, 1-5 is actual rating

[Voting-documtion](https://www.axsmap.com/faq/) from the AXSMap documentation:

- 1 star – door swings in, small stalls, tall sinks, no bar supports around toilet
- 2 stars – door swings in, average stalls, tall sinks, no bar supports around toilet
- 3 stars – door swings out, large stalls, tall sinks, no bar supports around toilet
- 4 stars – door swings out, large stalls, lowered sinks, one bar support around toilet
- 5 stars – door swings out, large stalls, lowered sinks, two bar supports around toilet
Remember reviews are subjective. 

### Further accessibility attributes

- `spacious` - as number of community votes
- `parking` - as number of community votes
- `quiet` - as number of community votes
- `welllit` - as number of community votes
- `guidedog` - as number of community votes 
- `secondentrance` - as number of community votes
- `ramp` - as number of community votes

### Place information

- `$oid`: AXSmap ID - local AXSmap ID
- `place_id` Google Places ID: Deep link to the - place in AXS Map in format : axsmap.com/venue/ *place_id* (e.g. [Example for the json-object above](https://axsmap.com/venue/ChIJO6_O_lxZwokRQ3c5GO6sTkE)
- `google_url`: Google Places URL
- `types`: List of google places categories of this place
- `lngLat`: longitude and latitude
- `name`: Name of the place
- `state`: state [state, region, or province]
- `city`: city
