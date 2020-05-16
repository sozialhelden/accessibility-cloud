import { Categories } from '/both/api/categories/categories.js';

export default function getCategories() {
  const categoryIdForSynonyms = {};

  Categories.find({}).fetch().forEach(category => {
    category.synonyms.forEach(s => {
      if (s) {
        categoryIdForSynonyms[s] = category._id;
      }
    });
  });

  return categoryIdForSynonyms;
}
