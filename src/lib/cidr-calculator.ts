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

export function calculateSubnets(
  vpcCidr: string,
  numSubnets: number,
  subnetCidrMask: string
): { cidr: string; totalAddresses: number }[] {
  if (!isValidCIDR(subnetCidrMask)) {
    throw new Error("Invalid subnet CIDR mask format");
  }

  const vpcCidrParts = vpcCidr.split("/");
  const vpcIpAddress = vpcCidrParts[0];
  const vpcMask = parseInt(vpcCidrParts[1]);
  const subnetMask = parseInt(subnetCidrMask.slice(1));

  if (!isValidIPv4(vpcIpAddress)) {
    throw new Error("Invalid VPC IPv4 address format");
  }

  if (subnetMask <= vpcMask || subnetMask > 32) {
    throw new Error("Subnet CIDR mask must be greater than VPC CIDR mask and less than or equal to 32");
  }

  const totalAvailableSubnets = 2 ** (subnetMask - vpcMask);
  if (numSubnets > totalAvailableSubnets) {
    throw new Error(`Number of subnets exceeds the maximum available (${totalAvailableSubnets})`);
  }

  const vpcIpParts = vpcIpAddress.split(".").map(Number);
  let vpcIpBinary = 0;
  for (let i = 0; i < 4; i++) {
    vpcIpBinary = (vpcIpBinary << 8) + vpcIpParts[i];
  }

  const subnetResults: { cidr: string; totalAddresses: number }[] = [];
  for (let i = 0; i < numSubnets; i++) {
    const subnetAddressBinary = vpcIpBinary + (i * (2 ** (32 - subnetMask)));
    const subnetAddress = ipFromBinary(subnetAddressBinary);
    const totalAddresses = 2 ** (32 - subnetMask);
    subnetResults.push({ cidr: `${subnetAddress}${subnetCidrMask}`, totalAddresses });
  }

  return subnetResults;
}
