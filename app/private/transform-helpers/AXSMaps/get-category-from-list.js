function getCategoryFromList(categories) {
  if (!categories) {
    return 'undefined';
  }

  for (let i = 0; i < categories.length; ++i) {
    const c = categoryIdForSynonyms[categories[i]];
    if (c) {
      return c;
    }
  }
  return 'undefined';
}
