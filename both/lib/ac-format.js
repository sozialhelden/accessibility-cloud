// These are the AC format building blocks. At a later stage, they are supposed to be based on a
// 'real' type system, for example Flowtype, at compile time and runtime.

export const pointGeometryFormat = {
  type: 'Point',
  coordinates: [
    -123.13700000000000045,
    49.251339999999999009,
  ],
};

export const groundFormat = {
  isLevel: true,
  distanceToDroppedCurb: '<20m ±10',      // interpretation of 'nearby',
  slopeAngle: '6deg',
  isCobbleStone: true,                    // RFC: replace with 'evenPavement'
  turningSpace: '<150cm',                 // interpretation of 'very narrow'
  streetIsSloping: true,
};

export const stairsFormat = {
  count: 123,
  nosing: {
    isHighContrast: false,
    isAntiSlip: true,
  },
  name: 'mainStaris',
  stepHeight: 1,
  hasHandRail: true,
  hasStairLift: true,
  hasStairWay: true,
  hasHoist: true,
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

export const liftFormat = {
  name: 'Main Lift',
  hasVoiceAnnounceSystem: true,
  hasEmergencyVoiceIntercom: true,
  isBroken: true,
  isBeingMaintained: true,
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


export const entranceFormat = {
  name: 'Main Entrance',
  ratingForWheelchair: 0.9,
  isMainEntrance: true,
  isLevel: false,
  isALift: true,
  hasRemovableRamp: false,
  hasSlope: true,
  slopeAngle: '6%',
  hasVisibleAndReadableSign: true,        // needs review
  hasBrailleSitemap: true,
  intercom: {
    isAvailable: true,
    height: '90..120cm',
    isColorContrastedWithWall: true,      // needs review
  },
  stairs: stairsFormat,
  door: doorFormat,
  lift: liftFormat,
  payment: paymentFormat,
};


export const vendingMachineFormat = {
  name: 'Ticket Machine 1',
  easyToUse: true,
  languages: ['en', 'de'],
  hasHeadPhoneJack: true,
  hasSpeech: true,
  controls: {
    height: '<120cm',
    areHighContrast: true,
    inBraille: true,
    areRaised: true,
  },
  payment: paymentFormat,
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
  languages: ['en', 'de'],
  turningSpaceInFront: '>140cm',
  isClearlyVisibleWhileSeated: true,
  isInformationReadableWhileSeated: true,
};

export const roomFormat = {
  name: 'Room name',
};

export const toiletFormat = {
  heightOfBase: '40 .. 45cm',
  spaceOnLeftSide: '>70',
  spaceOnRightSide: '>70',
  spaceInFront: '>70',
  foldableHandles: {
    onLeftSide: true,
    onRightSide: true,
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
};

export const restroomFormat = Object.assign({}, roomFormat, {
  signage: {
    unisex: true,
    male: true,
    female: true,
  },
  ratingForWheelchair: 0.3,
  turningSpaceInside: '>150cm',
  mirror: {
    isAccessibleWhileSeated: true,
    heightFromGround: '100cm',
  },
  hasSupportRails: true,
  shampooAccessibleWithWheelchair: true,
  toilet: toiletFormat,
  hasBathTub: true,
  hasShower: true,
  entrance: entranceFormat,
  shower: showerFormat,
  heightOfSoapAndDrier: '100 .. 120cm',
  washBasin: {
    accessibleWithWheelchair: true,
    height: '>80cm',
    spaceBelow: {
      height: '> 67cm',
      depth: '30cm',
    },
  },
});

export const sitemapFormat = {
  distanceFromEntrance: '<10m',
  isBraille: true,
  isRaised: true,
  hasLargePrint: true,
  languages: ['en'],
  hasSimpleLanguage: true,
};


export const acFormat = {
  _id: 'someId',
  acVersion: '1',

  properties: {
    originalId: '3',

    lastSourceImportId: 'R7tbPmwn8Jbhi54rM',
    infoPageUrl: 'https://...',
    placeWebsiteUrl: 'https://...',

    license: {
      name: 'GPLv3',
      licenseURL: 'https://accessibility.cloud/licenses/23asxas23k2d2',
    },

    sourceId: 'BwEuneiKbLGJyEeDE',
    sourceDetails: {
      name: 'source name',
      sourceURL: 'https://',
    },

    name: 'Hotel Adlon',                              // short name
    description: '',                                  // optional
    address: '',
    phoneNumber: '',
    category: 'hotel',                                // see [ac-categories]

    accessibility: {
      accessibleWith: {
        wheelchair: true,
        guideDog: true,
        limitedSight: true,
      },
      partiallyAccessibleWith: {
        wheelchair: true,
        guideDog: true,
        limitedSight: true,
      },
      offersActivitiesForPeople: {
        hearingImpairment: true,
        learningImpairment: true,
        physicalImpairment: true,
        visualImpairment: true,
        aphasia: true,
      },
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

          ground: groundFormat,

          pathways: {                               // RFC do we need this group?
            // turningSpaceInFrontOfRelevantFurniture: '>140', // find better adj for 'relevant'
            // widthOfOpeningsAndAisles: '> 140cm',
            // widthOfAllOpeningsAndAisles: '>90',             // RFC
            // width: '>150',
            // widthAtObstacles: '>90cm',
            // spaceBetweenExistingBallards: '>90cm',
            width: '>150',
            widthAtObstacles: '>90cm',
            maxLongitudinalSlope: '<6deg',
            maxLateralSlope: '<2.5deg',
          },

          entrances: [entranceFormat],
          restrooms: [restroomFormat],
          sitemap: sitemapFormat,
          lifts: [liftFormat],

          powerOutlets: {
            haveContrastColor: true,
            isErgnomicToUse: true,
            hasChildProtection: true,
            height: '10 .. 30cm',
          },

          controlsAndSwitches: {
            haveContrastColor: true,
            isErgnomicToUse: true,
            height: '120cm',
          },

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

          vendingMachines: [
            vendingMachineFormat,
          ],

          cashRegister: {
            height: '90cm',
            payment: paymentFormat
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

          services: {                                     // RFC? do we need to group these
            hasRemovableFurniture: false,
            hasInductionLoop: true,
            hasRemoteControlAudioSigns: true,
            hasServiceInSignLanguage: true,
            hasTableService: true,
            transferToRegularSeatPossible: true,

            hasMobileSafetyDepositBox: true,
            hasChangingTable: true,                       //
            hasFlashingOrVibratingFireAlarm: true,

            hasPoolAccessFacility: true,
            hasSaunaWheelchair: true,
            hasManualWheelchair: true,
            hasAllTerrainWheelchair: true,
            hasVehiclesAdaptedForWheelchairs: true,
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
  geometry: pointGeometryFormat,
};
