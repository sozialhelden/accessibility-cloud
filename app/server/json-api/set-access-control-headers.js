import httpMethodHandlers from './http-methods';

export function setAccessControlHeaders(res, methodsArray = null) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methodsArray || Object.keys(httpMethodHandlers));
  // eslint-disable-next-line max-len
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Encoding, Accept-Language, Cache-Control, Connection, Referer, User-Agent, X-Requested-With, X-Token, X-App-Token, X-User-Token, Content-Type, elastic-apm-traceparent, traceparent');
  res.setHeader('Access-Control-Max-Age', 86400);
}
