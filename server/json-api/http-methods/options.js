import httpMethodHandlers from './index';

export function OPTIONS({ res }) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', Object.keys(httpMethodHandlers));
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', 86400);
}
