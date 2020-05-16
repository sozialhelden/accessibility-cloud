import { SourceAccessRequests } from '../../source-access-requests';

export default function ignoreAccessRequest({
  requestId,
}) {
  SourceAccessRequests.update(requestId, {
    $set: {
      requestState: 'ignored',
    },
  });
}
