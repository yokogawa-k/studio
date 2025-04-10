
import { isValidIPv4, isValidCIDR } from "./validators";

interface CIDRResult {
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalAddresses: number;
}

export function calculateCIDR(ipAddress: string, cidrMask: string): CIDRResult {
  if (!isValidIPv4(ipAddress)) {
    throw new Error("Invalid IPv4 address format");
  }

  if (!isValidCIDR(cidrMask)) {
    throw new Error("Invalid CIDR mask format");
  }

  const mask = parseInt(cidrMask.slice(1));
  if (mask < 0 || mask > 32) {
    throw new Error("CIDR mask must be between 0 and 32");
  }

  const ipParts = ipAddress.split(".").map(Number);
  let ipBinary = 0;
  for (let i = 0; i < 4; i++) {
    ipBinary = (ipBinary << 8) + ipParts[i];
  }

  const maskBinary = ((1 << mask) - 1) << (32 - mask);
  const networkAddressBinary = ipBinary & maskBinary;
  const broadcastAddressBinary = ipBinary | ~maskBinary;

  const networkAddress = ipFromBinary(networkAddressBinary);
  const broadcastAddress = ipFromBinary(broadcastAddressBinary);
  const firstUsableIp = mask === 31 ? 'N/A' : ipFromBinary(networkAddressBinary + 1);
  const lastUsableIp = mask === 31 ? 'N/A' : ipFromBinary(broadcastAddressBinary - 1);
  const totalAddresses = mask === 31 ? 2 : 2 ** (32 - mask);

  return {
    networkAddress,
    broadcastAddress,
    firstUsableIp,
    lastUsableIp,
    totalAddresses,
  };
}

function ipFromBinary(ipBinary: number): string {
  return [
    (ipBinary >>> 24) & 255,
    (ipBinary >>> 16) & 255,
    (ipBinary >>> 8) & 255,
    ipBinary & 255,
  ].join(".");
}
