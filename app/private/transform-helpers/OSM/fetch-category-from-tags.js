function fetchCategoryFromTags(tags) {
  if (tags === undefined) {
    return 'empty';
  }

  const matchingTag = _.find(Object.keys(tags), (tag) => {
    const categoryId = `${tag}=${tags[tag]}`.toLowerCase().replace(' ', '_');
    return categoryIdForSynonyms[categoryId];
  });

  if (matchingTag) {
    const categoryId = `${matchingTag}=${tags[matchingTag]}`
      .toLowerCase()
      .replace(' ', '_');
    return categoryIdForSynonyms[categoryId];
  }
  return 'undefined';
}
