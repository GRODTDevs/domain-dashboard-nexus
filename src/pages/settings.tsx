
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);
  
  const handleSaveSettings = () => {
    // In a real application, we would save these settings to the backend
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your domain dashboard preferences</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for domain expiry and other important events
                </p>
              </div>
              <Switch 
                id="email-notifications" 
                checked={emailNotifications} 
                onCheckedChange={setEmailNotifications} 
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="expiry-days" className="font-medium">Expiry Warning Period</Label>
              <p className="text-sm text-muted-foreground mb-2">
                How many days before expiration to start showing warnings
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryWarningDays(Math.max(7, expiryWarningDays - 7))}
                >
                  -
                </Button>
                <span className="w-16 text-center">{expiryWarningDays} days</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpiryWarningDays(Math.min(90, expiryWarningDays + 7))}
                >
                  +
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-medium">Email Address</Label>
              <p className="text-sm">admin@example.com</p>
            </div>
            <div>
              <Label className="font-medium">Role</Label>
              <p className="text-sm">Administrator</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Change Password</Button>
            <Button variant="destructive">Delete Account</Button>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
