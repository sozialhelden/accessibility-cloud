# ac-format (temp)

# Accessibility Cloud exchange format

## Considerations

- Needs to be easily convertible into existing data-formats for services like AXSMaps, Jaccede, and Wheelmap.
- Should enable import of very detailed data for different needs and focus areas
- Should be structured
- Should be extendible but backwards compatible
- Should be human readable and as compact as neccessary.
- The general structure of [jaccedeMapAPI](http://apidoc.jaccede.com/) is a good starting point.
- There should be a current valid schema for the complete accessiblity-specification. Thise schema is validated during import and mappings with invalid datapoints or formats produce warnings and are omitted. However, additions, refinements and clarifications of that schema should be moderated by the ac-community painless and fast. (e.g. 1-3 days between suggestion and implementation).
- Sooner or later a visual mapping / exploration / description of the data catalog is necessary. [This concept](https://invis.io/XF8W2XHE4#/130859674_A06-Details) can be a good starting point.
- We group different aspects of the accessibility-data spacially (entrance, stairs, restrooms) instead of need (wheelchair vs. visually impaired).
- Should balance depth of data structure with amount of properties.  E.i. don't nest two properties for the sake of nesting.
- Group interpreting/summarization properties outside of groups (e.g. don't nest `.isStepFree`  into `.steps.`. Otherwise the path of the complete property would be awkward to read (`.entrance.isStepFree` is better than `.entrance.steps.isStepFree`)
- Types of accessibility should clarified -> bad: `isAccessible` better: `accessibleWithWheelchar`

## Code-style

- Geoinformation should be geoJSON format.
- For disccusion we can use use a point-notation e.g. `data.accessibility.withWheelchair`

## Preliminary (Under discussion)

- We avoid overall accessibility-ratings like "50% accessible".
- We summarize the accessiblity for different needs with "fully|partial|none" as originally introduced by _Jaccede_. This interpartion/summary has to provided through mapping during the data import.

## Needs discussion / open questions

- "steps" vs. "stairs" -> "stairs"
- do we ignore multiple entries, rooms, facilities,lifts?
- how do we deal with "jaccede::services/equipment/Other/pleaseSpecify" ?
- "Lavatories" vs. "restroom" -> should be 'restrooms' for now
- "restroom" vs. "restrooms" -> should be plural, if array
- room description could be identically for hotel-rooms, dining-rooms, meeting, rooms, etc.
- "hotelroom" vs "hotelRooms" -> area of type "bedroom"


## more questions
- "categories" as array?

### group stuff by areas

```
  areas[]
    .entrances[]
    .restrooms[]
      .shower
      .entrance
  .lifts[]
  .stairs[]
``

- separete 'indoors' and 'outdoors' anly as types of area?
- make `dining-area.` a special type of `area.`?


### `accessibleWithWheelchair` vs. `ratingForWheelchair`

- Reality will demanand a final yes/no answer from AC.
- Many sources rate the accessibility on a scale (e.g. from 1-5 Stars)
- Some sources rate the accessibility as yes/limited/no -> could be translated into rating
- Maybe we could phrase the answere as something like 'likelyhoodOfAccessibilityByWheelchair'


## A sample response block including all possible properties

Note:

- This refinement of this format is still in progress as more and more data-sources are being added.
- The definitiona below is in javascript to allow for comments and fewer quotation-marks.
This is an updated data-structure, the groups accessibility data into areas of different types:

- 'inside'
- 'outside'
- 'pool-area'
- 'terrace'
- 'dining'

```
{
  _id: 'ttikRCM5Sz2v2m3cZ',
  sourceId: 'BwEuneiKbLGJyEeDE',
  acVersion: '1',
  lastSourceImportId: 'R7tbPmwn8Jbhi54rM',
  detailsURL: 'https://...',

  license: {

  },
  source: {
    sourceURL: 'https://',
    name: 'source name',
  },

  properties: {
    name: 'Hotel Adlon',                              // short name
    description: '',                                  // optional
    address: '',
    originalId: '234234',                             // id within data-source
    category: 'hotel',                                // see [ac-categories]

    accessibility: {
      accessibleWith: {
        wheelchair: true,
        guideDog: true,
        limitedSight: true,
      },

      offersActivitiesFor: {
        hearingImpaired: true,
        learningImpaired: true,
        physicallyImpaired: true,
        visuallyImpaired: true,
      },

      stairs: [
        {
          count: '>10 ± 2',
          hasHighcontrastAndAntiSlipStairNosing: true,    // needs review
          name: 'mainStaris',
          stepHeight: '12cm ±1',
          hasHandRail: true,
          hasStairLift: true,
          hasTactileSafetyStrip: true,
          wheelChairPlatformLift: {
            height: '120cm',
            width: '110cm',
          },
        },
      ],

      areas: [
        {                                                        // 'hotelRoom?'
          tags: ['indoors', 'outdoors', 'meeting-room', 'confidential', 'bedroom', 'terrace', 'roof','font-space'],   // TBD
          name: '',
          floorLevel: 1,

          ratingSpacious: 1,                      // needs review
          isWellLit: true,
          isQuiet: true,

          ground: {
            isStepLess: true,
            distanceToDroppedCurb: '<20m ±10',      // interpretation of 'nearby',
            slopeAngle: '6deg',
            isCobbleStone: true,                    // RFC: replace with 'evenPavement'
            turningSpace: '<150cm',                 // interpretation of 'very narrow'
            streetIsSloping: true,
          },

          pathways: {                               // RFC do we need this group?
            //turningsSpaceInFrontOfRelevantFurniture: '>140',        // find better adj for 'relevant'
            //widthOfOpeningsAndAisles: '> 140cm',
            //widthOfAllOpeningsAndAisles: '>90',             // RFC
            //width: '>150',
            //widthAtObstacles: '>90cm',
            //spaceBetweenExistingBallards: '>90cm',
            width: '>150',
            widthAtObstacles: '>90cm',
            maxLongitudinalSlope: '<6deg',
            maxLateralSlope: '<2.5deg',
          },

          entrances: [
            {
              name: 'Main Entrance',
              ratingForWheelchair: 0.9,
              isMainEntrance: true,
              isStepFree: false,
              isALift: true,
              hasRemovableRamp: false,
              slopeAngle: '6%',                       //
              hasVisualSign: true,                    // needs review
              hasBrailleSign: true,

              intercom: {
                isAvailable: true,
                height: '90..120cm',
                isColorContrastedWithWall: true,      // needs review
              },
              stairs: {
                count: '>10 ± 2',
                hasHighcontrastAndAntiSlipStairNosing: true,    // needs review
                name: 'mainStaris',
                stepHeight: '12cm ±1',
                hasHandRail: true,
                hasStairLift: true,
                hasTactileSafetyStrip: true,
                wheelChairPlatformLift: {
                  height: '120cm',
                  width: '110cm',
                },
              },
              door: {
                isAutomatic: false,
                width: '85cm',
                hasClearMarkingOnGlassDoor: false,
                isEasyToHoldOpen: false,
                hasErgonomicDoorHandle: false,
                isRevolving: false,
              },
            },
          ],
          restrooms: [
            {
              ratingForWheelchair: 0.3,
              turningSpaceInside: '>150cm',
              hasBathTub: true,
              mirrorAccessibleWhileSeated: true,
              heightOfMirrorFromGround: '100cm',
              hasSupportRails: true,
              heightOfSoapAndDrier: '100 .. 120cm',
              hasSpaceAlongsideToilet: true,
              washBasinAccessibleWithWheelchair: true,
              shampooAccessibleWithWheelchair: true,

              entrance: {
                isAutomatic: false,
                doorWidth: '85cm',
                hasClearMarkingOnGlassDoor: false,
                isEasyToHoldOpen: false,
                hasErgonomicDoorHandle: false,
                isStepFree: true,
                turningSpaceInFront: '>150cm',
                doorOpensToOutside: true,
              },
              toilet: {
                heightOfBase: '40 .. 45cm',
                spaceOnLeftSide: '>70',
                spaceOnRightSide: '>70',
                foldableHandles: {
                  onLeftSide: true,
                  onRightSide: true,
                  height: '>85cm',
                  extensionOverToilet: '>28cm',     // RFC: better label required,
                  distance: '60 .. 65cm',
                },
              },
              hasShower: true,
              shower: {
                hasSupportRails: true,
                step: '<2cm',
                isWalkIn: true,                        // needs review
                supportRails: {
                  height: '85 .. 107cm',
                  aboveAndBelowControls: true,
                },
                controls: {
                  height: '85cm',
                  isEasyToUse: true,
                  hasErgonomicHandle: true,
                },
                hasShowerSeat: true,
                showerSeat: {
                  isRemovable: true,
                  isFixed: false,
                  isFoldable: false,
                },
              },
              washBasin: {
                accessibleWithWheelchair: true,
                height: '>80cm',
                spaceBelow: {
                  height: '> 67cm',
                  depth: '30cm',
                },
              },
            },
          ],

          powerOutlets: {
            haveContrastColor: true,
            isErgnomicToUse: true,
            hasChildProtection: true,
            height: '10 .. 30cm',
          },
          switches: {                           // RFC: rename to "controls?"
            haveContrastColor: true,
            isErgnomicToUse: true,
            height: '120cm',
          },

          bed: {
            height: '120cm ± 10',
            adjustableHeight: '30 .. 140cm',
            turningSpaceBeside: '>90cm',
            spaceBelow: '20cm',
          },

          wardrobe: {
            heightForRail: '<140cm',
            turningSpaceInFront: '>140cm',
          },

          changingRoom: {
            turningSpaceInside: '>150cm',
            hasSupportRails: true,
            heightOfMirrorFromGround: '100cm',
            heightOfHooks: '<120cm',
            seatingIsPossible: true,
          },

          stage: {
            isAccessibleWithWheelchair: true,
            durationOfLift: '<10sec',                 // RFC this is very special
            turningSpace: '150cm',
          },

          vendingMachines: [
            {
              name: 'Ticket Machine 1',
              easyToUse: true,
              languages: [en, de],
              hasHeadPhoneJack: true,
              hasSpeech: true,
              controls: {
                height: '<120cm',
                areHighContrast: true,
                inBraille: true,
                areRaised: true,
              },
            },
          ],

          cashRegister: {
            height: '90cm',
            hasRemovableCreditCardReader: true,
          },

          wheelchairPlaces: {
            count: 1,
            hasSpaceForAssistent: true,
          },

          tables: {
            height: '60 .. 80cm',
            spaceBelow: {
              height: '>67cm',
              depth: '>30cm',
            },
          },

          seats: {
            height: '20 .. 120cm',
          },

          services: {                                     // RFC? do we need to group these 
            hasRemovableFurniture: false,
            hasInductionLoop: true,
            hasRemoteControlAudioSigns: true,

            hasTableService: true,
            transferToRegularSeatPossible: true,

            hasMobileSafetyDepositBox: true,
            hasHoist: true,
            hasChangingTable: true,                       //
            hasFlashingOrVibratingFireAlarm: true,

            hasPoolAccessFacility: true,
            hasSaunaWheelchair: true,
            hasManualWheelChair: true,
            hasAllTerrainWheelChair: true,
            hasVehiclesAreAdaptedForWheelchairs: true,
          },

          sitemap: {
            distanceFromEntrance: '<10m',
            isBraille: true,
            isRaised: true,
            hasLargePrint: true,
            languages: ['en'],
            hasSimpleLanguage: true,
          },

          tactileGuideStrips: {
            isGuidingToInfoDesk: true,                              // needs review
            hasVisualContrat: true,
          },

          infoDesk: {
            heightOfCounter: '<=80cm',
            distanceToEntrance: '<10m',
          },

          signage: {
            isReadible: true,
            languages: ['de'],
          },

          media: [
            {
              type: 'documents',                          // documents|menu|audioGuide|presentations|exhibits|movie|screen,
              name: 'Speisekarte',
              isBraille: true,
              isAudio: true,
              isLargePrint: true,
              hasContrastingBackground: true,
              isEasyToUnderstand: true,
              hasDedicatedScreenForSubtitles: true,
              hasSubtitles: true,
              hasRealtimeCaptioning: true,
              languages: ['en', 'de'],
              turningSpaceInFront: '>140cm',
              isClearlyVisibleWhileSeated: true,
              isInformationReadableWhileSeated: true,
            },
          ],
        },
      ],
      staff: {
        canSeeVisitorsFromInside: true,
        canAssistWithSpecialNeeds: true,
        isTrainedInSigning: true,
        hasFreeAssistentForVisitors: true,
        isTrainedInAccomodattingVisitorsWithDisabilities: true,   // very unspecific and loooong
      },
      lifts: [
        {
          name: 'Main Lift',
          hasVoiceAnnounceSystem: true,
          hasEmergencyVoiceIntercom: true,
          controls: {
            height: '90 .. 120cm',
            isHighContrast: true,
            isBraille: true,
            isRaised: true,
          },
          cabin: {
            width: '140cm',
            length: '110cm',
            door: {
              width: '100cm',
            },
          },
        },
      ],
      parking: {
        parkingSpacesForWheelchairUsers: {
          areAvailable: true,
          location: '2nd floor',
          count: 2,
          isLocatedInside: true,              // needs review
          width: '>350cm',
          length: '>500cm',
          hasDedicatedSignage: true,
        },
      },
    },
  },
  geometry: {
    type: 'Point',
    coordinates: [
      -123.13700000000000045,
      49.251339999999999009,
    ],
  },
};




## Properties 

- We should invest some time to think about dealing with property-types early, because making things "up on the fly" will likely either make things inprecise, or difficult to read either for machines or humans.
- API responses should be concise:
    - if possible optimized for a target audience (e.g. wheelchair users) and locale (e.g. United States)
    - only include existing data (no "undefined" properties)
    - should avoid interpretation (the recommendations for required door width might vary between different countries)
    - if possible avoid attributes that require clarification (e.g. restroom is 45% accessible)
    - should be convertible/styleable into beautiful output with a library (see chapter "interpreting and styling data")
    - be made for human consumption (isAccessible: 20% does not help me)
- Property names should ...
    - be as concise as possible
    - be american english
    - start with `is*` or `has*` if a boolean
    - should avoid accronyms (`WC` -> `toilet`)
    - be camelCase
    - not repeat parent-attributes (e.g. bad: `"doorOpening.doorWidth": ...`  better: `"entrance.width" : "90cm +-5"`)
    - not include units (e.g. bad: `"doorOpening.widthInCm" : ...`   better: `".entrance.width": ">90cm"`)
    - not include ranges (e.g. bad: `"steps.moreThan3: ..."`  better: `".steps.count": ">3"` )
    - focus on good accessibility rather than negative obstacles:  e.g. `.isEasyToHoldOpen` or `hasErgnomicHandle` are better than `.difficultToOpen`, `doorHandleNotPractical`, or `isNotMainEntrance`
    - not be confused with translation (e.g. If we call a property 'Restroom' or 'Bathroom' can be solved by synonyms or translations)
    - indicate interpreting summaries with a `rating*`-prefix, e.g. `entrance.ratingForWheelchair`
- Precision may vary for various reasons:
    - edges might be curved or slanted
    - precise measuring might not be possible.
    - multipe entities with a range of values might exist (e.g. several doors or windows)
    - it's better to have an non-accurate estimation that no attribute at all.
    - We are aware of the intrisinc complexity. But we can add this feature later.
- Different units should be supported: widths and height might be specified and cm, however, distances (like to the next parking spot) are given in m or even kilometer.
- Properties should also store relavancy for different needs.
- Also definitions of valid/required valid-ranges together with references would be of enormous value.

## Example definition of a property

As of Oct 2016 this is under heavy development and not even close to production.

    'accessibility.entrance.door.width': { '_id': 'accessibility.access.entrance.door.width', 'parentId':'accessibility.entrance.door', 'name': 'width', 'path': 'accessibility.entrance.door.width', 'translations': { 'en-US': "Door-width", 'de-CH': "Türbreite", }, 'explainingImageURL': "", 'acPropertyIcon': "", 'relevancyForUserGroups': { 'wheelchair': 0.85, 'blind': 0, 'visuallyImpaired': 0, }, 'description': { 'en-UK': "markdown wiki-description with links guidelines and discussions", } 'preferedUnit': 'cm', 'contraints': { // TBD }, }

## Requirement Catalogues

For certifications, collecting deep data and filtering places by certain requirements or standards, it could be very useful to translate requirement specifications for into a machine-readible format. Consider [this German requirements catalog for accessible travels](http://www.reisen-fuer-alle.de/qualitaetskriterien_fuer_rollstuhlfahrer_324.html).

It features a list of well-defined criterias that can be matched against the ac-format described above. Thus a requirement-catalog can be seen as:

- a list of property-requirements
- a list of explanations for property-requires
- clear identification of target purpose, author, data, legal-status or relevant laws
- restricted to regions or countries
- structured into serveral levels: (partically accessible, fully accessible)

With a clear definition of such a catalogue it would be possible to implement very efficient data-collection tools, reference-documents, or – in the long run – the basis for machine learning algorithms that will automate the gathering of properties through image- or 3d-scan analysis.

The data-structure for a requirement-catalogue might look like this:

```
    particiallyAccessibleWithWheelchair: {

        title: {
            en: 'Certified partially accessible with wheelchair (DSFT)',
            de: 'Barrierefreiheit geprüft – teilweise barrierefrei (DSFT)',
        },
        description: {

        },
        relevancy: {
            withWheelchair: 1,
            withElectricWheelchair: 1,
        },
        legalStatus: 'voluntairy certificate',
        websiteURL: 'http://www.reisen-fuer-alle.de/qualitaetskriterien_fuer_rollstuhlfahrer_324.html',
        criteriaGroup: {
            title: {
                de: 'Allgemeines',
            },
            description: {
            },
            criteriaList:[
                {
                    description: {
                        de: 'Alle Durchgänge/Wege sind mindestens 90 cm breit.
    (Weg außen, Tür, Weg innen, Aufzug, Raum, Schlafraum, Küche, Speiseraum, Umkleidekabine)',
                    },
                    propertyId: 'accessibility.widthOfAllOpeningsAndAisles',
                    importance: 'required',
                    ranges: {
                        '<90cm': 'not fullfilled',
                        '90cm .. 120cm': 'fullfilled',
                        '>120cm': 'excellent',
                    }
                },
                {
                    description: {
                        de: 'Alle Durchgänge/Wege sind mindestens 90 cm breit. (Weg außen, Tür, Weg innen, Aufzug, Raum, Schlafraum, Küche, Speiseraum, Umkleidekabine)',
                    },
                    properties: [
                        {
                            propertyId: 'accessibility.widthOfAllOpeningsAndAisles',
                            importance: 'required',
                            ranges: {
                                '<90cm': 'not fullfilled',
                                '90cm .. 120cm': 'fullfilled',
                                '>120cm': 'excellent',
                            },
                        },
                        {
                            propertyId: 'accessibility.indoors.widthOfAislesAndOpenings',
                            importance: 'required',
                            ranges: {
                                '<90cm': 'not fullfilled',
                                '90cm .. 120cm': 'fullfilled',
                                '>120cm': 'excellent',
                            },
                        },
                    ]
                },
            ],
        }
    }
```





## Reoccuring property-groups

- Reoccuring elements should be consistent: the description format of entrances should be identical for `entrance`, `room.entrance.`, `room.restroom.entrance`
- Attributes (like the "width of a door") and relevant value ranges (less or more than 90cm) should be separated. The interpretation/format of the value should not be mixed with the storage of the value in the database.
- The exported format should be optimized for human readibility 

        entrance: { isAutomatic: false, doorWidth: "85cm ±2", hasClearMarkingOnGlassDoor: false, isEasyToHoldOpen: false, hasErgonomicDoorHandle: false, isStepFree: true, turningSpaceInFront: ">150cm", },

### Boolean properties

- The world is not black and white. However the data of AC should be optimized for the consumption by non-expert, which prefare "we believe this place is accessible for wheelchair users" over "93% of reviewers gave an accessiblity-rating for 50% or higher". If necessary, we should not sacrifice the usefulness for the majority of the users over the requirements and opinions of few domain-experts. Never the less, we should always try provide additional data on how a boolean yes/no claim has been made.
- To avoid legal claims AC should clearily reject all responsibility for the quality of the given data.
- For a specific place we should only store boolean-attributes if a clear 'yes|no' was possible. For undecided properties we should leave the db-reference blank.

#### Numeric properties ("Qualifiers")

- Examples:
    - `entrance.doorOpening.width`
    - `entrance.doorOpening.heightOfDoorHandle`
    - `entrance.doorOpening.heightOfSingleStep`

### Strings properties

- Examples
    - Addresse etc.

### Times / Opening-Hours


## Interpreting and styling data

- AC should provide a library that allows the interpretation of response data.
- For all properties we should have offer a locale interpretation schema that includes...
    - translation
    - descriptions
- valid/recommented/required ranges, e.g. ".doorOpening.width" : { "<0.9":   }
    - relevancy for different forms of disability
    - human readible units (e.g. cm/inch, vs. m/ft vs. km/miles)
    - backlink to AC-wiki for that property with further discussion, norms, laws, regulations for different countries.
- The lib should of functionality for converting metric data into human readible local "0.900001±1" -> "90cm".

## Storing properties with precision in the database

- Use-cases to think about:
    - less-then
    - more than
    - exactly
    - between x .. y
    - ± a certain amount
- This qualifiers should be combineable:
    - e.g. `"building.access.entrance.door.width": "80..90cm ± 5"`
    - e.g. `"building.access.entrance.stepCount": ">25 ± 3"`
- This topics needs further research: We need to balance:
    - performance impact of converting units on API-responses (this could impact caching)
    - possibility to perform precise db-queries (e.g. "all hotels in Berlin with a step between 5 and 10cm")


#### Additional references

Wiki-Data has a very elaborate system of defining the valid ranges of properties.

- [WikiData All Properties](https://www.wikidata.org/wiki/Wikidata:Database_reports/Constraint_violations/All_properties)
- [WikiData Constraints](https://www.wikidata.org/wiki/Template:Constraint)


### Fringe-Cases that eventually need specification

- non-point geo-information (e.g. rolling stock (e.g. trains), parks, path-ways)
- image-annotations
- 3d-models / scans
- surface-properties (curbs on street-corners)

### Additional questions

- How do we handle changes in the AC-property-structure. It would be conventient to store the schema definition through Id <-> parentId-relationships. Ideally, theses IDs should be human readible, short, immunatable, and respresent the property's path. Obviously these criteria are contradictory.
- These IDs are 


## References to different accessibliity-cataloges

- [Qualitätskriterien für Rollstuhlfahrer](http://www.reisen-fuer-alle.de/qualitaetskriterien_fuer_rollstuhlfahrer_324.html)