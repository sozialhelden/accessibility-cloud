export function getDisplayedNameForUser(user) {
  const email = user && user.emails && user.emails[0] && user.emails[0].address;
  return email || 'Unknown user';
}
