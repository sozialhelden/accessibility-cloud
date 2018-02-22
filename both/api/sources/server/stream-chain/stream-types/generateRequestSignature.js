// @flow
import JSSHA from 'jssha';
import { check, Match } from 'meteor/check';


export default function generateRequestSignature({
  body,
  signature,
}) {
  check(signature, Match.ObjectIncluding({
    algorithm: Match.OneOf('SHA-1', 'SHA-224', 'SHA3-224', 'SHA-256', 'SHA3-256', 'SHA-384', 'SHA3-384', 'SHA-512', 'SHA3-512', 'SHAKE128', 'SHAKE256'),
    password: String,
    passwordType: Match.OneOf('B64', 'HEX', 'TEXT'),
    outputType: Match.OneOf('B64', 'HEX'),
  }));

  const shaObj = new JSSHA(signature.hashType || 'SHA-1', 'TEXT');
  shaObj.setHMACKey(signature.password, signature.passwordType || 'TEXT');
  shaObj.update(body);
  return shaObj.getHMAC(signature.outputType || 'B64');
}
