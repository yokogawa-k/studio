"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCIDR } from "@/lib/cidr-calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

export default function Home() {
  const [ipAddress, setIpAddress] = useState("");
  const [cidrMask, setCidrMask] = useState("");
  const [result, setResult] = useState<ReturnType<typeof calculateCIDR> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      const calculatedResult = calculateCIDR(ipAddress, cidrMask);
      setResult(calculatedResult);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setResult(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-secondary">
      <Card className="w-full max-w-md space-y-4 p-4">
        <CardHeader>
          <CardTitle>CIDR Calculator</CardTitle>
          <CardDescription>
            Calculate network details from an IP address and CIDR mask.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="ip-address">IP Address</Label>
            <Input
              type="text"
              id="ip-address"
              placeholder="e.g., 192.168.1.0"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cidr-mask">CIDR Mask</Label>
            <Input
              type="text"
              id="cidr-mask"
              placeholder="e.g., /24"
              value={cidrMask}
              onChange={(e) => setCidrMask(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Calculate
          </Button>

          {result && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">Results:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Network Address: <span className="font-medium">{result.networkAddress}</span>
                </li>
                <li>
                  Broadcast Address: <span className="font-medium">{result.broadcastAddress}</span>
                </li>
                <li>
                  First Usable IP: <span className="font-medium">{result.firstUsableIp}</span>
                </li>
                <li>
                  Last Usable IP: <span className="font-medium">{result.lastUsableIp}</span>
                </li>
                <li>
                  Total Addresses: <span className="font-medium">{result.totalAddresses}</span>
                </li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
