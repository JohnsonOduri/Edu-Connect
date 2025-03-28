
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, Lock, Bell, Users, Database, CloudUpload, Key } from "lucide-react";
import { ApiKeyManager } from "./ApiKeyManager";

export const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground mt-1">
          Configure authentication, security, and system preferences
        </p>
      </div>

      {/* API Key Manager */}
      <ApiKeyManager />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Authentication & Security</CardTitle>
            </div>
            <CardDescription>
              Configure how users sign in and manage security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA option for all users
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Complexity</Label>
                <p className="text-sm text-muted-foreground">
                  Require strong passwords
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="outline" className="w-full mt-2">
              Advanced Security Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure system and user notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send email for important events
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Assignment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Send reminders about upcoming deadlines
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Announcements</Label>
                <p className="text-sm text-muted-foreground">
                  Broadcast important system updates
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="outline" className="w-full mt-2">
              Configure Notification Templates
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>User Permissions</CardTitle>
            </div>
            <CardDescription>
              Manage roles and access controls
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Self Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow users to register accounts
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Teacher Self-Enrollment</Label>
                <p className="text-sm text-muted-foreground">
                  Allow teachers to create courses without approval
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Course Creation</Label>
                <p className="text-sm text-muted-foreground">
                  Allow non-admin users to create courses
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="outline" className="w-full mt-2">
              Manage Role Permissions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>
              Configure backups and data settings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Automated Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Schedule regular system backups
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Retention</Label>
                <p className="text-sm text-muted-foreground">
                  Configure data retention policies
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Analytics Collection</Label>
                <p className="text-sm text-muted-foreground">
                  Collect usage data for improvements
                </p>
              </div>
              <Switch />
            </div>
            <Button variant="outline" className="w-full mt-2">
              Export System Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
