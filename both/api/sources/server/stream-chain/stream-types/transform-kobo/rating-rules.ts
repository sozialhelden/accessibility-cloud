import { isMatch, isEqual, entries, get, intersection } from 'lodash';

// TODO align with ac format when available, add operator support
export interface Quantity {
  value: number;
  unit: string;
}

// rule types
type Comparable = number | string | Quantity;
type ExistsValue = { $exists: boolean };
type LessThan = { $lt: Comparable };
type LessThanEquals = { $lte: Comparable };
type GreaterThan = { $gt: Comparable };
type GreaterThanEquals = { $gte: Comparable };
type Equals = { $eq: Comparable };
type NotEquals = { $ne: Comparable };
type MatchValue = string | number | undefined | null | boolean |
  ExistsValue | LessThan | LessThanEquals | GreaterThan | GreaterThanEquals | Equals | NotEquals;
type MatchRule = {
  [key: string]: MatchValue,
};
type OrRule = {
  $or: ReadonlyArray<Rule>,
};
export type Rule = OrRule | MatchRule;

// three valued logic for a11y
export type RuleEvaluationResult = 'true' | 'false' | 'unknown';


// combine multiple rules with a three valued or, with the order of true > false > unknown
// this does not align with Kleene and Priest logics, but knowing that a rule does not apply
// is strong enough reason to determine that the or should be fals
function evaluateOrRule(data: {}, orRule: OrRule): RuleEvaluationResult  {
  let finalResult: RuleEvaluationResult = 'unknown';

  for (const rule of orRule.$or) {
    const result = evaluateRule(data, rule);

    if (result === 'true') {
      return 'true';
    }
    // apply no if found
    if (finalResult === 'unknown') {
      finalResult = result;
    }
  }
  return finalResult;
}

// read the value out of a quantity
function getQuantityValue(a: string | number | Quantity) : number | string {
  let aValue: number | string = 0;
  if (typeof a === 'object') {
    // todo use better conversion in the future
    const multiplier = a.unit === 'inch' ? 2.54 : 1;
    aValue = a.value * multiplier;
  } else {
    aValue = a;
  }
  return aValue;
}

// the allowed operator types for comparisons
type Operators = '$eq' | '$lt' | '$lte' | '$gt' | '$gte' | '$ne';
const allowedOperators: ReadonlyArray<Operators> =
  Object.freeze(['$eq', '$lt', '$lte', '$gt', '$gte', '$ne'] as Operators[]);

// compare two values using an operator, if they are quantities, read the underlying value
function compareByOperator(
    first: Comparable,
    second: Comparable,
    operator: Operators = '$eq'): boolean {
  const a = getQuantityValue(first);
  const b = getQuantityValue(second);
  if (operator === '$eq') {
    return a === b;
  }
  if (operator === '$lt') {
    return a < b;
  }
  if (operator === '$lte') {
    return a <= b;
  }
  if (operator === '$gt') {
    return a > b;
  }
  if (operator === '$gte') {
    return a >= b;
  }
  if (operator === '$ne') {
    return a !== b;
  }
  return false;
}

// checks wether the given data matches the rule
function evaluateMatchRule(data: {}, rule: MatchRule): RuleEvaluationResult  {
  let finalResult: RuleEvaluationResult | undefined = undefined;
  for (const [path, matcher] of entries(rule)) {
    const fieldData = get(data, path);
    const isObjectMatch = matcher !== null && typeof matcher === 'object';
    const isExistsRule = isObjectMatch && matcher.hasOwnProperty('$exists');

    if (typeof fieldData === 'undefined' && !isExistsRule) {
      // data is missing, we don't know if anything about this rule
      return 'unknown';
    }if (isObjectMatch) {
      let matched = false;
      const foundOperators = intersection(allowedOperators, Object.keys(matcher)) as Operators[];
      if (foundOperators.length === 1) {
        // compare by operator
        matched = compareByOperator(fieldData, matcher[foundOperators[0]], foundOperators[0]);
      } else if (isExistsRule) {
        // custom exists check
        matched = typeof fieldData !== 'undefined';
      } else {
        // match object hierarchy
        matched = isMatch(fieldData, matcher as object);
      }

      if (!matched) {
        // any failed comparision and we fail the whole match
        return 'false';
      }
      if (typeof finalResult === 'undefined') {
        // mark result as yes, and continue checking
        finalResult = 'true';
      }
    } else {
      // normal data, do a deep equals
      const equals = isEqual(fieldData, matcher);
      if (!equals) {
        // any failed comparision and we fail the whole match
        return 'false';
      }
      if (typeof finalResult === 'undefined') {
        // mark result as yes, and continue checking
        finalResult = 'true';
      }
    }
  }
  return finalResult || 'unknown';
}

// evaluates any kind of rule
export function evaluateRule(data: {}, rule: Rule): RuleEvaluationResult {
  if (rule.$or) {
    return evaluateOrRule(data, rule as OrRule);
  }
  if (typeof rule === 'object') {
    return evaluateMatchRule(data, rule as MatchRule);
  }

  return 'unknown';
}
