function estimateFlagFor(obj, voteCount) {
  const maxVotes = _.max([
    obj.spacious,
    obj.ramp,
    obj.parking,
    obj.quiet,
    obj.secondentrance,
  ]);

  if (maxVotes === 0) {
    return undefined;
  }

  return voteCount / maxVotes > 0.5;
}
