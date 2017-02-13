function fetchNameFromTags(tags) {
  if (tags == null) {
    return '?';
  }

  return tags.name || 'object';
}
