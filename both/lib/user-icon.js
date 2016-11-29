import { Meteor } from 'meteor/meteor';

export function getGravatarHashForEmailAddress(address) {
  return CryptoJS.MD5(address.trim().toLowerCase()).toString();
}

export function getGravatarImageUrl(hash) {
  return `https://secure.gravatar.com/avatar/${hash}?d=retro`;
}

export function getIconHTMLForUser(user) {
  let url = null;
  if (user) {
    const services = user.services;
    if (services && Object.keys(services) && Object.keys(services).length) {
      if (services.facebook) {
        const facebookId = services.facebook.id;
        if (facebookId) {
          const currentUserServices = Meteor.user() && Meteor.user().services;
          const currentUserFacebook = currentUserServices.facebook;
          const accessToken = currentUserFacebook && currentUserFacebook.accessToken;
          if (accessToken) {
            // This would be cool, but the access token might be invalid in the meantime. Meh.
            //   "https://graph.facebook.com/#{id}/picture?access_token=#{accessToken}"
            url = `http://graph.facebook.com/${facebookId}/picture`;
          }
        }
      }
      if (!url && services.twitter) {
        url = services.twitter.profile_image_url_https;
      }
      if (!url && services.google) {
        url = services.google.picture;
      }
    } else {
      const hash = user.profile && user.profile.gravatarHash;
      if (hash) {
        url = getGravatarImageUrl(hash);
      }
    }
  }
  url = url || '/icons/anonymous.svg';
  return `<img src="${url}" class='user-icon'>`;
}

if (Meteor.isServer) {
  Meteor.startup(() => {
    Meteor.users.find({ 'profile.gravatarHash': { $exists: false } }).observe({
      added(user) {
        const address = user && user.emails && user.emails[0] && user.emails[0].address;
        if (address) {
          const hash = getGravatarHashForEmailAddress(user.emails[0].address);
          Meteor.users.update(user._id, { $set: { 'profile.gravatarHash': hash } });
          console.log('Updated gravatar hash for', address);
        }
      },
    });
  });
}
