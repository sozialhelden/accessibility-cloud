# AC interachange format

## Considerations:

- Needs to be easily convertible into existing data-formats for services like AXSMaps, Jaccede, and Wheelmap.
- Should enable import of very detailed data for different needs and focus areas
- Should be structured
- Should be extendible but backwards compatible
- Should be human readable and as compact as neccessary.
- The general structure of [jaccedeMapAPI](http://apidoc.jaccede.com/) is a good starting point.
- There should be a current valid schema for the complete accessiblity-specification. Thise schema is validated during import and mappings with invalid datapoints or formats produce warnings and are omitted. However, additions, refinements and clarifications of that schema should be moderated by the ac-community painless and fast. (e.g. 1-3 days between suggestion and implementation).
- Sooner or later a visual mapping / exploration / description of the data catalog is necessary. [This concept](https://invis.io/XF8W2XHE4#/130859674_A06-Details) can be a good starting point.
- We group different aspects of the accessibility-data spacially (entrance, stairs, restrooms) instead of need (wheelchair vs. visually impaired).

## Code-style

- Property names...
    - should be lowercase camelCase
    - should be plain English
    - should avoid accronyms
- Geoinformation should be geoJSON format.
- For disccusion we can use use a point-notation e.g. `data.accessibility.withWheelchair`

## Preliminary (Under discussion)

- We avoid overall accessibility-ratings like "50% accessible".
- We summarize the accessiblity for different needs with "fully|partial|none" as originally introduced by _Jaccede_. This interpartion/summary has to provided through mapping during the data import.

## A sample definition block looks like this:

```
{
    "_id": "ttikRCM5Sz2v2m3cZ",
    "sourceId": "BwEuneiKbLGJyEeDE",
    "acVersion": "1",
    "lastSourceImportId": "R7tbPmwn8Jbhi54rM",

    "properties": {
        "name": "Hotel Adlon",                               // short name
        "description": "",                                   // optional
        "address": "",
        "providedId": "234234",                              // id within data-source
        "category": "hotel",                                 // see [ac-categories]

        "accessibility": {
            withWheelchair: true|false,
            withGuidanceDog: true|false,
            withLimitedSight: true|false,
            entrance: {
                wheelchair: 0.5,
                blind: "braillesignage",
                access: {
                    stepFree: false,
                    oneStepWithHeight: 10,
                    ramp: false,
                    lift: false,
                },
                doorOpening: {
                    automatic: false,
                    width: 30,
                    isMainEntrance: true,
                },
                doorObstacles: {
                    noMarkingOnGlassDoor: false,
                    doorDifficultToHoldOpen: false,
                    doorHandleNotPractical: false,
                }, 
                restrooms: {
                    wheelchair: 0.1,
                },
            }
        },
    }
    "geometry": {
        "type": "Point",
        "coordinates": [
            -123.13700000000000045,
            49.251339999999999009
        ]
    }
}
```


## The original interpretation of the Jaccede API-Data format (2015)

Sadly, the latest version of the Jaccede-API seems to have discarded that format.

```
{
    accessibility_is: "total|partial|none",
    entrance: {
        access: {
            step_free: false,
            one_step_with_height_cm: 10,
            ramp: false,
            lift: false,
        },
        door_opening: {
            manual: false,
            automatic: false,
            width_cm: 30,
            is_main_entrance: true,
        },
        door_obstacles: {
            no_marking_on_glass_door: false,
            door_difficult_to_hold_open: false,
            door_handle_not_practical: false,
        },
    },
    mobility: {
        stairs: {
            detectable_warning_band : true
            contrasting_anti_slip_stair_nosing : true
            handrails : true
        },
        in_aisle: {
            difficult | easy
        }
    },
    lifts: large | standard | small,
    lift has: {
        voice_announcement_for_floor_levels: true,
        buttons_in_high_relief_or braille: true,
        buttons_at_wheelchair_level: false,
    },
    services_and_facilities {
        desk_counter_at_accessible_height: true,
    },
    restrooms: {
        accessible | low_degree_of_accessibility |
        inaccessible | unknown
    },
    outside: {
        curb: true,
        cobblestones: true,
        narrow: true,
        no_obstacles: true,
        visible_and_legible_signage: true,
        disable_parking_space_nearby {
            location: {
                //...
            }
        },
        accessible_transportation_available {
            contact: {
                //...
            }
        }
    },
    overall_rating: '40%',
}
```

