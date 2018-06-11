
// @flow

const ThrottleMeasureDuration = 5 * 1000;
const MaxAllowedFrequency = 3;

export function shouldThrottleByIp(collection: Mongo.Collection, hashedIp: string) {
  const throttleDate = new Date(new Date().getTime() - (ThrottleMeasureDuration));
  const count = collection.find({
    hashedIp,
    timestamp: { $gte: throttleDate },
  }, { fields: {} }).count();

  return count > MaxAllowedFrequency;
}
