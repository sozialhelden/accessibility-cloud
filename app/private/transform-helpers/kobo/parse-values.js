
(() => {
  const parseValue = (data, field, type) => {
    const rawValue = data[field];
    if (rawValue === null || typeof rawValue === 'undefined') {
      return rawValue;
    }

    if (type === 'yesno') {
      if (rawValue === 'true') {
        return true;
      }
      return (rawValue === 'false' ? false : undefined);
    }

    if (type === 'hasSubObject') {
      return parseValue(data, field, 'yesno') ? {} : undefined;
    }

    if (type === 'float') {
      return parseFloat(rawValue);
    }

    if (type === 'int') {
      return parseInt(rawValue, 10);
    }

    return undefined;
  };

  const parseYesNo = (data, field) => parseValue(data, field, 'yesno');

  const parseHasSubObject = (data, field) => parseValue(data, field, 'hasSubObject');

  const parseFloatUnit = (data, field, unit, operator) => {
    const value = parseValue(data, field, 'float');
    const unitValue = _.pickBy({
      operator,
      unit,
      value,
    });
    return (value && !isNaN(value)) ? unitValue : undefined;
  };

  const parseIntUnit = (data, field, unit, operator) => {
    const value = parseValue(data, field, 'int');
    const unitValue = _.pickBy({
      operator,
      unit,
      value,
    });
    return (value && !isNaN(value)) ? unitValue : undefined;
  };

  return {
    parseValue,
    parseYesNo,
    parseHasSubObject,
    parseFloatUnit,
    parseIntUnit,
  };
// eslint-disable-next-line semi
})()
