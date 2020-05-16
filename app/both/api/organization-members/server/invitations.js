import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Random } from 'meteor/random';
import { Email } from 'meteor/email';
import { check } from 'meteor/check';
// import CryptoJS from 'meteor/jparker:crypto-md5';
import { OrganizationMembers } from '../organization-members';
import { Organizations } from '/both/api/organizations/organizations';
import { getDisplayedNameForUser } from '/both/lib/user-name';
import { getGravatarHashForEmailAddress } from '/both/lib/user-icon';

const invitationEmailBody = ({ userName, organizationId, organizationName, token }) =>
`Hi,

${userName} invites you to their organization “${organizationName}” on accessibility.cloud,
an app that collects accessibility information about places.

Use this link to sign up and get access:

${Meteor.absoluteUrl(
  `organizations/${organizationId}/accept-invitation/${token}`,
  { secure: true }
)}

All the best,
Your accessibility.cloud team.
`;


function insertPlaceholderMembership(options) {
  const member = {
    organizationId: options.organizationId,
    invitationToken: options.token,
    invitationEmailAddress: options.emailAddress,
    role: options.role,
    invitationState: 'queuedForSending',
    // eslint-disable-next-line new-cap
    gravatarHash: getGravatarHashForEmailAddress(options.emailAddress),
  };

  console.log('Placeholder member:', member);

  const id = OrganizationMembers.insert(member);
  return OrganizationMembers.findOne(id);
}


function sendInvitationEmailTo(userEmailAddress, organizationId, role) {
  check(userEmailAddress, String);
  check(organizationId, String);
  check(role, String);
  const emailAddress = userEmailAddress.toLowerCase().trim();
  const organization = Organizations.findOne({ _id: organizationId });
  const token = Random.secret();
  const organizationName = organization.name;
  const member = insertPlaceholderMembership({ emailAddress, organizationId, token, role });
  const userName = getDisplayedNameForUser(Meteor.user());
  const selector = { _id: member._id };
  try {
    Email.send({
      from: 'support@accessibility.cloud',
      to: emailAddress,
      subject: `${userName} invites you to access their organization “${organizationName}”`,
      text: invitationEmailBody({ userName, organizationName, organizationId, token }),
    });

    OrganizationMembers.update(selector, { $set: { invitationState: 'sent' } });
  } catch (error) {
    OrganizationMembers.update(selector, { $set: {
      invitationState: 'error',
      invitationError: error,
    } });
  }

  return member;
}

function useTokenToVerifyEmailAddressIfPossible(userId, memberId, token) {
  check(userId, String);
  check(memberId, String);
  check(token, String);
  console.log('Trying to use invitation token to verify email address...');
  const member = OrganizationMembers.findOne({ _id: memberId, invitationToken: token });
  if (!member) {
    throw new Meteor.Error(404, `No member with id ${memberId} existing.`);
  }

  const emailAddress = member.invitationEmailAddress;
  const user = Meteor.user();
  const addresses = _.pluck(user.emails, 'address');
  const index = addresses.indexOf(emailAddress);

  if (index < 0) {
    console.log(`Can't use token for email verification, invitation went to '${emailAddress}'.`);
    console.log(`User's email addresses are ${JSON.stringify(_.pluck(user.emails, 'address'))}.`);
    return false;
  }

  if (user.emails[index].verified) {
    console.log(`Invitation email address '${emailAddress}' already verified`);
    console.log('do not re-verify it via invitation token.');
    return true;
  }

  console.log("Verifying email address '${emailAddress}' via invitation token...");
  Meteor.users.update({ _id: userId }, { $set: { [`emails.${index}.verified`]: true } });
  return true;
}

export function inviteUserToOrganization(emailAddress, organizationId, role) {
  const invitationEmailAddress = emailAddress.toLowerCase().trim();

  console.log(`Inviting ${emailAddress} to organization ${organizationId}...`);

  let member = OrganizationMembers.findOne({ organizationId, invitationEmailAddress });

  if (member) {
    console.log(`${invitationEmailAddress} already invited.`);
    return member;
  }

  const addressRegExp = invitationEmailAddress.replace(/([^a-zA-Z0-9])/g, '\\$1');
  const user = Meteor.users.findOne(
    { 'emails.address': { $regex: addressRegExp, $options: 'i' } }
  );

  if (user) {
    console.log(
      `${invitationEmailAddress} already registered (${user._id}), adding a member if necessary…`
    );
    member = OrganizationMembers.findOne({ userId: user._id, organizationId });
    if (member) {
      console.log(`${invitationEmailAddress} is already in organization ${organizationId}.`);
      return member;
    }
    const memberId = OrganizationMembers.insert({ userId: user._id, organizationId, role });
    console.log(`Inserted member ${memberId}.`);
    return OrganizationMembers.findOne(memberId);
  }

  console.log(`${invitationEmailAddress} no user of our app yet, sending invitation...`);

  member = sendInvitationEmailTo(invitationEmailAddress, organizationId, role);
  return member;
}

export function acceptInvitation(userId, organizationId, token) {
  check(userId, String);
  check(organizationId, String);
  check(token, String);

  console.log(userId, 'accepts invitation to', organizationId, 'with token', token, '…');

  const member = OrganizationMembers.findOne({ organizationId, invitationToken: token });

  if (!member) {
    console.log(`No invitation found to ${organizationId} with token ${token}.`);
    return null;
  }

  if (OrganizationMembers.findOne({ organizationId, userId })) {
    OrganizationMembers.remove(member._id);
    console.log(`${userId} accepted invitation to ${organizationId} already.`);
    console.log('Deleted existing invitation.');
    return member;
  }

  useTokenToVerifyEmailAddressIfPossible(userId, member._id, token);

  OrganizationMembers.update(
    { _id: member._id },
    {
      $set: { userId, invitationState: 'accepted' },
      $unset: { invitationToken: 1 },
    }
  );

  const memberAfterUpdate = OrganizationMembers.findOne(member._id);
  console.log(`${userId} now member of ${organizationId}`, 'as', memberAfterUpdate);

  return member;
}
