export function displayedUserName(user, userId) {
  return (user && user.emails && user.emails[0] && user.emails[0].address) || userId || user._id;
}
