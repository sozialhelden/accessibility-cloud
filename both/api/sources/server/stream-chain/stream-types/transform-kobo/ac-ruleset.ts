import { Rule, evaluateRule } from './rating-rules';

// constants
export const flatStepHeight = { unit: 'cm', value: 7, operator: '<=' };

// TODO put real values in here!
export const wheelChairWashBasin = {
  height: { unit: 'cm', operator: '>=', value: 80 },
  depth: { unit: 'cm', operator: '>=', value: 50 },
};

// the rules for determining that places are fully accessible
export const fullWheelchairA11yRuleSet: Rule = {
  // check that there are no stairs
  $or: [
    {
      'properties.accessibility.entrances.0.hasRemovableRamp': true,
    },
    {
      'properties.accessibility.entrances.0.stairs.0.count': 0,
    },
    {
      'properties.accessibility.entrances.0.stairs': null,
    },
    {
      'properties.accessibility.entrances.0.isLevel': true,
    },
  ],
  // TODO add more rules for door width etc.
};

// the rules for determining that places are at least partially accessible, omitting the full rules
export const partialWheelmapA11yRuleSet: Rule = {
  $or: [
    {
      'properties.accessibility.entrances.0.stairs.0.count': 1,
      'properties.accessibility.entrances.0.stairs.0.stepHeight':
        { $lte: { value: 7.0, unit: 'cm' } },
    },
  ],
  // TODO add more rules for door width etc.
};

export type A11yRating = 'yes' | 'no' | 'partial' | 'unknown';

// Evaluates the wheelchair accessibility using the predefined ac rulesets
export function evaluateWheelChairA11y(data: {}): A11yRating {
  const full = evaluateRule(data, fullWheelchairA11yRuleSet);
  if (full === 'true') {
    return 'yes';
  }

  const partial = evaluateRule(data, partialWheelmapA11yRuleSet);
  if (partial === 'true') {
    return 'partial';
  }

  if (full === 'false' || partial === 'false') {
    return 'no';
  }

  return 'unknown';
}
