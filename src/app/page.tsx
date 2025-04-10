"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCIDR, calculateSubnets } from "@/lib/cidr-calculator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function Home() {
  const [vpcCidr, setVpcCidr] = useState("");
  const [numSubnets, setNumSubnets] = useState("");
  const [subnetCidrMask, setSubnetCidrMask] = useState("");

  const [vpcResult, setVpcResult] = useState<ReturnType<typeof calculateCIDR> | null>(null);
  const [subnetResults, setSubnetResults] = useState<
    { cidr: string; totalAddresses: number }[] | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    try {
      if (!vpcCidr || !numSubnets || !subnetCidrMask) {
        throw new Error("Please fill in all fields.");
      }

      const numSubnetsValue = parseInt(numSubnets, 10);
      const subnetCidrMaskValue = parseInt(subnetCidrMask.slice(1), 10);

      if (isNaN(numSubnetsValue) || numSubnetsValue <= 0) {
        throw new Error("Number of subnets must be a positive number.");
      }

      if (isNaN(subnetCidrMaskValue) || subnetCidrMaskValue < 0 || subnetCidrMaskValue > 32) {
        throw new Error("Subnet CIDR mask must be a number between 0 and 32.");
      }

      const vpcCalculatedResult = calculateCIDR(vpcCidr.split('/')[0], vpcCidr.split('/')[1]);
      setVpcResult(vpcCalculatedResult);

      const calculatedSubnets = calculateSubnets(vpcCidr, numSubnetsValue, subnetCidrMask);
      setSubnetResults(calculatedSubnets);

      setError(null);
    } catch (e: any) {
      setError(e.message);
      setVpcResult(null);
      setSubnetResults(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-secondary">
      <Card className="w-full max-w-md space-y-4 p-4">
        <CardHeader>
          <CardTitle>VPC CIDR Calculator</CardTitle>
          <CardDescription>
            Calculate VPC and subnet details.
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
            <Label htmlFor="vpc-cidr">VPC CIDR</Label>
            <Input
              type="text"
              id="vpc-cidr"
              placeholder="e.g., 10.0.0.0/16"
              value={vpcCidr}
              onChange={(e) => setVpcCidr(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="num-subnets">Number of Subnets</Label>
            <Input
              type="number"
              id="num-subnets"
              placeholder="e.g., 4"
              value={numSubnets}
              onChange={(e) => setNumSubnets(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subnet-cidr-mask">Subnet CIDR Mask</Label>
            <Input
              type="text"
              id="subnet-cidr-mask"
              placeholder="e.g., /24"
              value={subnetCidrMask}
              onChange={(e) => setSubnetCidrMask(e.target.value)}
            />
          </div>

          <Button onClick={handleSubmit} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Calculate
          </Button>

          {vpcResult && subnetResults && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold mb-2">VPC Results:</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Network Address: <span className="font-medium">{vpcResult.networkAddress}</span>
                </li>
                <li>
                  Broadcast Address: <span className="font-medium">{vpcResult.broadcastAddress}</span>
                </li>
                <li>
                  First Usable IP: <span className="font-medium">{vpcResult.firstUsableIp}</span>
                </li>
                <li>
                  Last Usable IP: <span className="font-medium">{vpcResult.lastUsableIp}</span>
                </li>
                <li>
                  Total Addresses: <span className="font-medium">{vpcResult.totalAddresses}</span>
                </li>
              </ul>

              <h2 className="text-lg font-semibold mt-4 mb-2">Subnet Results:</h2>
              {subnetResults.length > 0 ? (
                <ul className="list-decimal pl-5 space-y-1">
                  {subnetResults.map((subnet, index) => (
                    <li key={index}>
                      Subnet {index + 1}: CIDR - <span className="font-medium">{subnet.cidr}</span>, Total Addresses -{" "}
                      <span className="font-medium">{subnet.totalAddresses}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No subnets to display.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
