
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "@/components/ui/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const { toast } = useToast();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [expiryWarningDays, setExpiryWarningDays] = useState(30);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    localStorage.getItem("backgroundImage")
  );
  const [logoImage, setLogoImage] = useState<string | null>(
    localStorage.getItem("logoImage")
  );
  const [activeTab, setActiveTab] = useState("notifications");
  
  const handleSaveSettings = () => {
    // Save notification settings
    localStorage.setItem("emailNotifications", String(emailNotifications));
    localStorage.setItem("expiryWarningDays", String(expiryWarningDays));
    
    toast({
      title: "Settings saved",
      description: "Your settings have been updated successfully.",
    });
  };
  
  const handleSaveAppearance = () => {
    // Save appearance settings
    if (backgroundImage) {
      localStorage.setItem("backgroundImage", backgroundImage);
    } else {
      localStorage.removeItem("backgroundImage");
    }
    
    if (logoImage) {
      localStorage.setItem("logoImage", logoImage);
    } else {
      localStorage.removeItem("logoImage");
    }
    
    toast({
      title: "Appearance updated",
      description: "Your appearance settings have been updated successfully.",
    });
  };
  
  useEffect(() => {
    // Load settings from localStorage
    const savedEmailNotifications = localStorage.getItem("emailNotifications");
    const savedExpiryWarningDays = localStorage.getItem("expiryWarningDays");
    
    if (savedEmailNotifications !== null) {
      setEmailNotifications(savedEmailNotifications === "true");
    }
    
    if (savedExpiryWarningDays !== null) {
      setExpiryWarningDays(parseInt(savedExpiryWarningDays));
    }
  }, []);
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground">Manage your domain dashboard preferences</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications">
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
        </TabsContent>
        
        <TabsContent value="account">
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
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your domain dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ImageUpload
                  label="Logo"
                  value={logoImage || ""}
                  onChange={setLogoImage}
                  className="col-span-1"
                />
                
                <ImageUpload
                  label="Login Background"
                  value={backgroundImage || ""}
                  onChange={setBackgroundImage}
                  className="col-span-1"
                />
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Appearance Preview</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  This is how your login page will appear to users
                </p>
                <div className="relative h-40 overflow-hidden rounded border border-border">
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
                  >
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {logoImage && (
                        <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                          <img 
                            src={logoImage} 
                            alt="Company Logo" 
                            className="max-h-20 max-w-32" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveAppearance}>Save Appearance</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
