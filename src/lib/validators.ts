
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex =
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  if (!ipv4Regex.test(ip)) {
    return false;
  }
  const parts = ip.split(".").map(Number);
  return parts.every((part) => part >= 0 && part <= 255);
}

export function isValidCIDR(cidr: string): boolean {
  const cidrRegex = /^\/\d{1,2}$/;
  return cidrRegex.test(cidr);
}

