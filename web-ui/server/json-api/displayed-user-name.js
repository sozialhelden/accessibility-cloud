export function displayedUserName(user, userId) {
  return (user && user.emails && user.emails[0] && user.emails[0].address) || user && user._id || userId;
}
