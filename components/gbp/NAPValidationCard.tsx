'use client';

/**
 * NAP Validation Card Component
 *
 * Displays Name, Address, Phone validation status for a dealership
 * with actionable insights and fix recommendations
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Phone,
  Building2
} from 'lucide-react';

interface NAPValidation {
  isConsistent: boolean;
  name: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  address: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  phone: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  lastChecked: string;
  confidenceScore: number;
}

interface NAPValidationCardProps {
  dealerId: string;
  dealerName: string;
  validation?: NAPValidation | null;
  lastChecked?: Date | null;
  onRefresh?: () => Promise<void>;
}

export function NAPValidationCard({
  dealerId,
  dealerName,
  validation,
  lastChecked,
  onRefresh
}: NAPValidationCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle2 className="h-5 w-5 text-green-600" />
    ) : (
      <XCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const needsRecheck = lastChecked
    ? Date.now() - new Date(lastChecked).getTime() > 7 * 24 * 60 * 60 * 1000
    : true;

  if (!validation && !lastChecked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            NAP Validation
          </CardTitle>
          <CardDescription>
            Validate your Google Business Profile listing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No NAP validation data available. Run a validation check to ensure your
              business information is consistent across platforms.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefresh}
            className="mt-4 w-full"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Run NAP Validation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              NAP Validation
            </CardTitle>
            <CardDescription>
              {dealerName} - Google Business Profile
            </CardDescription>
          </div>

          {validation && (
            <Badge
              variant={validation.isConsistent ? 'default' : 'destructive'}
              className="ml-2"
            >
              {validation.isConsistent ? 'Consistent' : 'Issues Found'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Status */}
        {validation && (
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Consistency Score</p>
              <p className={`text-2xl font-bold ${getConfidenceColor(validation.confidenceScore)}`}>
                {(validation.confidenceScore * 100).toFixed(0)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Last Checked</p>
              <p className="text-sm font-medium">
                {lastChecked ? new Date(lastChecked).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>
        )}

        {/* Name Validation */}
        {validation?.name && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.name.isValid)}
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Business Name</span>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              {validation.name.value}
            </p>
            {validation.name.issues && validation.name.issues.length > 0 && (
              <Alert variant="destructive" className="ml-9">
                <AlertDescription className="text-sm">
                  {validation.name.issues.map((issue, i) => (
                    <div key={i}>• {issue}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Address Validation */}
        {validation?.address && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.address.isValid)}
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Address</span>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              {validation.address.value}
            </p>
            {validation.address.issues && validation.address.issues.length > 0 && (
              <Alert variant="destructive" className="ml-9">
                <AlertDescription className="text-sm">
                  {validation.address.issues.map((issue, i) => (
                    <div key={i}>• {issue}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Phone Validation */}
        {validation?.phone && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(validation.phone.isValid)}
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Phone Number</span>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              {validation.phone.value}
            </p>
            {validation.phone.issues && validation.phone.issues.length > 0 && (
              <Alert variant="destructive" className="ml-9">
                <AlertDescription className="text-sm">
                  {validation.phone.issues.map((issue, i) => (
                    <div key={i}>• {issue}</div>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Recheck Warning */}
        {needsRecheck && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              NAP validation is over 7 days old. Consider running a fresh check.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefresh}
            variant="outline"
            className="flex-1"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              window.open(
                'https://business.google.com/locations',
                '_blank'
              )
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on GBP
          </Button>
        </div>

        {/* Recommendations */}
        {validation && !validation.isConsistent && (
          <Alert>
            <AlertDescription>
              <p className="font-medium mb-2">Recommended Actions:</p>
              <ul className="text-sm space-y-1 ml-4">
                {!validation.name.isValid && (
                  <li>• Update your business name in Google Business Profile</li>
                )}
                {!validation.address.isValid && (
                  <li>• Verify and correct your address on Google Business Profile</li>
                )}
                {!validation.phone.isValid && (
                  <li>• Update your phone number to match across all platforms</li>
                )}
                <li>• Ensure consistency across website, social media, and directories</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default NAPValidationCard;
