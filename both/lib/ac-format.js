// These are the AC format building blocks. At a later stage, they are supposed to be based on a
// 'real' type system, for example Flowtype, at compile time and runtime.

export const pointGeometryFormat = {
  type: 'Point',
  coordinates: [
    -123.13700000000000045,
    49.251339999999999009,
  ],
};

export const equipmentAccessibilityFormat = {
  height: '90 .. 120cm',
  languages: ['en', 'de'],
  hasRaisedText: true,
  isBraille: true,
  hasSpeech: true,
  isHighContrast: true,
  hasLargePrint: true,
  isVoiceActivated: true,
  hasHeadPhoneJack: true,
  isEasyToUnderstand: true,
};


export const disruptionFormat = {
  properties: {
    placeInfoId: 'abc123',
    placeInfoIdType: 'Deutsche Bahn',
    equipmentId: 'abc123',
    isWorking: true,
    isInMaintenance: true,
    outOfServiceReason: 'Not usable due to construction work in the northern building half',
    furtherDescription: 'This text explains what\'s going on in detail',
    plannedCompletion: '2017-10-16T16:05:27.000+02:00',
    outOfServiceOn: '2017-10-10T16:05:27.000+02:00',
    outOfServiceTo: '2017-10-11T16:00:27.000+02:00',
    lastUpdate: '2017-10-10T16:05:27.000+02:00',
  },
  geometry: pointGeometryFormat,
};


export const equipmentFormat = {
  properties: {
    placeInfoId: 'abc123',
    description: 'zu Gleis 2/3',
    longDescription: 'zu Gleis 2 und 3',
    shortDescription: '→ Gleis 2/3',
    controls: equipmentAccessibilityFormat,
  },
  geometry: pointGeometryFormat,
};


export const escalatorFormat = equipmentFormat;


export const liftFormat = Object.assign({}, equipmentFormat, {
  hasEmergencyVoiceIntercom: true,
  cabin: {
    width: '140cm',
    length: '110cm',
    door: {
      width: '100cm',
    },
  },
});


export const stairsFormat = {
  count: 123,
  nosing: {
    isHighContrast: false,
    isAntiSlip: true,
  },
  name: 'mainStairs',
  stepHeight: 1,
  hasHoist: true,
  hasHandRail: true,
  hasStairLift: true,
  hasEscalator: true,
  hasTactileSafetyStrip: true,
  wheelChairPlatformLift: {
    height: '120cm',
    width: '110cm',
  },
};


export const doorFormat = {
  turningSpaceInFront: '>150cm',
  doorOpensToOutside: true,
  isAutomaticOrAlwaysOpen: false,
  isManual: true,
  isOpenNow: false,
  width: '85cm',
  hasClearMarkingOnGlassDoor: false,
  isEasyToHoldOpen: false,
  hasErgonomicDoorHandle: false,
  isRevolving: false,
  needsRadarKey: true,
  needsEuroKey: true,
};


export const groundFormat = {
  isLevel: true,
  distanceToDroppedCurb: '<20m ±10',      // interpretation of 'nearby',
  slopeAngle: '6deg',
  isCobbleStone: true,                    // RFC: replace with 'evenPavement'
  turningSpace: '<150cm',                 // interpretation of 'very narrow'
  streetIsSloping: true,
};


export const offerFormat = {
  name: 'Entry fee',
  amount: '10.00',
  currencyCode: 'EUR',
  lastUpdate: '2017-01-01', // ISO date string
};


export const paymentFormat = {
  hasMovablePaymentSystem: true,
  acceptsPaymentByApp: true,
  acceptsPaymentByMobilePhone: true,
  acceptsCreditCards: true,
  acceptsDebitCards: true,
  acceptsCoins: true,
  acceptsBills: true,
  offers: [offerFormat],
  customPaymentMetaInfo: ['SMS to +49 123…'], // e.g. for phone numbers, parking lot IDs etc.
};


export const vendingMachineFormat = Object.assign({}, equipmentFormat, {
  name: 'Ticket Machine 1',
  payment: paymentFormat,
});


export const sitemapFormat = Object.assign({}, equipmentFormat, {
  distanceFromEntrance: '<10m',
});


export const intercomFormat = Object.assign({}, equipmentFormat, {
  distanceFromEntrance: '<10m',
});


export const entranceFormat = {
  name: 'Main Entrance',
  ratingForWheelchair: 0.9,
  isMainEntrance: true,
  isLevel: false,
  isALift: true,
  hasSlope: true,
  slopeAngle: '6%',
  hasRemovableRamp: false,
  hasIntercom: true,
  intercom: intercomFormat,
  payment: paymentFormat,
  sitemap: sitemapFormat,
  stairs: stairsFormat,
  door: doorFormat,
  lift: liftFormat,
};


export const mediaFormat = {
  type: 'documents', // documents|menu|audioGuide|presentations|exhibits|movie|screen,
  name: 'Speisekarte',
  isBraille: true,
  isAudio: true,
  isLargePrint: true,
  hasContrastingBackground: true,
  isEasyToUnderstand: true,
  hasDedicatedScreenForSubtitles: true,
  hasSubtitles: true,
  hasRealtimeCaptioning: true,
  hasPlainLanguageOption: true,
  languages: ['en', 'de'],
  turningSpaceInFront: '>140cm',
  isClearlyVisibleWhileSeated: true,
  isInformationReadableWhileSeated: true,
};

export const roomFormat = {
  name: 'Room name',
  isAccessibleWithWheelchair: true,
};

export const toiletFormat = {
  heightOfBase: '40 .. 45cm',
  spaceOnLeftSide: '>70',
  spaceOnRightSide: '>70',
  spaceInFront: '>70',
  foldableHandles: {
    onLeftSide: true,
    onRightSide: true,
    onAtLeastOneSide: true,
    height: '>85cm',
    extensionOverToilet: '>28cm',     // RFC: better label required,
    distance: '60 .. 65cm',
  },
};

export const showerFormat = {
  step: '<2cm',
  isWalkIn: true,                        // needs review
  hasSupportRails: true,
  supportRails: {
    height: '85 .. 107cm',
    aboveAndBelowControls: true,
  },
  hasShowerSeat: true,
  hasErgonomicHandle: true,
  showerSeat: {
    isRemovable: true,
    isFixed: false,
    isFoldable: false,
  },
};


export const restroomFormat = Object.assign({}, roomFormat, {
  signage: {
    unisex: true,
    male: true,
    female: true,
  },
  mirror: {
    isLocatedInsideRestroom: true,
    isAccessibleWhileSeated: true,
    heightFromGround: '100cm',
  },
  ratingForWheelchair: 0.3,
  turningSpaceInside: '>150cm',
  hasSupportRails: true,
  shampooAccessibleWithWheelchair: true,
  toilet: toiletFormat,
  hasBathTub: true,
  hasShower: true,
  entrance: entranceFormat,
  shower: showerFormat,
  heightOfSoapAndDrier: '100 .. 120cm',
  washBasin: {
    isLocatedInsideRestroom: true,
    isAccessibleWithWheelchair: true,
    height: '>80cm',
    spaceBelow: {
      height: '> 67cm',
      depth: '30cm',
    },
  },
});

export const personalProfile = { // can be used to match a personal profile to offers
  muteness: true,
  guideDog: true,
  hearingImpairment: true,
  learningImpairment: true,
  limitedSight: true,
  physicalImpairment: true,
  visualImpairment: true,
  blindness: true,
  wheelchair: true,
  electricWheelchair: true,
};

export const acFormat = {
  _id: 'someId',
  acVersion: '1',

  properties: {
    originalId: '3',
    ids: [
      { provider: 'Deutsche Bahn', stationNumber: 123, ril100Identifier: 'KA', evaNumber: 123 },
    ],

    lastSourceImportId: 'R7tbPmwn8Jbhi54rM',
    infoPageUrl: 'https://...',     // link to the PoI on the data provider's platform
    editPageUrl: 'https://...',     // website where you can edit or contribute to the place data
    placeWebsiteUrl: 'https://...', // website of the place itself

    sourceId: 'BwEuneiKbLGJyEeDE',

    name: 'Hotel Adlon',                              // short name
    description: '',                                  // optional
    address: '',
    phoneNumber: '',
    emailAddress: '',
    category: 'hotel',                                // see [ac-categories]

    accessibility: {
      accessibleWith: personalProfile,
      partiallyAccessibleWith: personalProfile,
      offersActivitiesForPeopleWith: personalProfile,
      areas: [
        {                                                        // 'hotelRoom?'
          tags: [ // tbd
            'indoors',
            'outdoors',
            'meeting-room',
            'confidential',
            'bedroom',
            'terrace',
            'roof',
            'front-space',
          ],
          name: '',
          floorLevel: 1,

          ratingSpacious: 1,                      // needs review
          isWellLit: true,
          isQuiet: true,
          isSmoking: false,
          isNonSmoking: false,

          ground: groundFormat,

          pathways: {                               // RFC do we need this group?
            // turningSpaceInFrontOfRelevantFurniture: '>140', // find better adj for 'relevant'
            // widthOfOpeningsAndAisles: '> 140cm',
            // widthOfAllOpeningsAndAisles: '>90',             // RFC
            // width: '>150',
            // widthAtObstacles: '>90cm',
            // spaceBetweenExistingBallards: '>90cm',
            width: '>150cm',
            widthAtObstacles: '>90cm',
            maxLongitudinalSlope: '<6deg',
            maxLateralSlope: '<2.5deg',
          },

          entrances: [entranceFormat],
          restrooms: [restroomFormat],
          sitemap: sitemapFormat,
          lifts: [liftFormat],
          switches: [equipmentFormat],
          vendingMachines: [vendingMachineFormat],
          powerOutlets: [Object.assign({}, equipmentFormat, {
            hasChildProtection: true,
          })],

          beds: [{
            height: '120cm ± 10',
            adjustableHeight: '30 .. 140cm',
            turningSpaceBeside: '>90cm',
            spaceBelow: '20cm',
          }],

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

          cashRegister: {
            height: '90cm',
            payment: paymentFormat,
          },

          wheelchairPlaces: {
            count: 1,
            hasSpaceForAssistant: true,
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

          serviceContact: 'Call +49 030 12345678 to register',

          services: {                                     // RFC? do we need to group these
            hasRemovableFurniture: false,
            hasInductionLoop: true,
            hasRemoteControlAudioSigns: true,
            hasServiceInSignLanguage: true,
            hasTableService: true,
            transferToRegularSeatPossible: true,

            hasMobileSafetyDepositBox: true,
            hasChangingTable: true,
            hasFlashingOrVibratingFireAlarm: true,

            hasPoolAccessFacility: true,
            hasSaunaWheelchair: true,
            hasManualWheelchair: true,
            hasAllTerrainWheelchair: true,
            hasVehiclesAdaptedForWheelchairs: true,
            hasMobilityService: true,
          },

          tactileGuideStrips: {
            isGuidingToInfoDesk: true,                              // needs review
            hasVisualContrast: true,
          },

          infoDesk: {
            heightOfCounter: '<=80cm',
            distanceToEntrance: '<10m',
          },

          signage: {
            isReadible: true,
            hasSameMeaningInMonochromatic: true,
            languages: ['de'],
          },

          media: [mediaFormat],
        },
      ],
      staff: {
        canSeeVisitorsFromInside: true,
        canAssistWithSpecialNeeds: true,
        isTrainedInSigning: true,
        hasFreeAssistentForVisitors: true,
        isTrainedInAccomodatingVisitorsWithDisabilities: true,   // very unspecific and loooong
      },
      parking: {
        forWheelchairUsers: {
          isAvailable: true,
          location: '2nd floor',
          count: 2,
          isLocatedInside: true,              // needs review
          width: '>350cm',
          length: '>500cm',
          maxHeight: '>500cm',
          hasDedicatedSignage: true,
          paymentBySpace: true,
          paymentByZone: true,
          neededParkingPermits: ['Blue Badge'],
        },
        payment: paymentFormat,
        lifts: [liftFormat],
      },
    },
  },
  geometry: pointGeometryFormat,
};
