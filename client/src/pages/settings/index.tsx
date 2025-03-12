import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Check, Save, User, Building, DollarSign, Percent } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Settings</h1>
        <p className="text-[#718096]">Manage your application settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-0">
            <Tabs
              orientation="vertical"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full flex flex-col items-stretch h-auto space-y-1 bg-transparent p-2">
                <TabsTrigger
                  value="profile"
                  className="justify-start px-4 py-2 data-[state=active]:bg-[#F5F7FA] data-[state=active]:text-primary data-[state=active]:font-medium rounded-md text-left"
                >
                  <User className="h-4 w-4 mr-2" />
                  User Profile
                </TabsTrigger>
                <TabsTrigger
                  value="company"
                  className="justify-start px-4 py-2 data-[state=active]:bg-[#F5F7FA] data-[state=active]:text-primary data-[state=active]:font-medium rounded-md text-left"
                >
                  <Building className="h-4 w-4 mr-2" />
                  Company Information
                </TabsTrigger>
                <TabsTrigger
                  value="pricing"
                  className="justify-start px-4 py-2 data-[state=active]:bg-[#F5F7FA] data-[state=active]:text-primary data-[state=active]:font-medium rounded-md text-left"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing Defaults
                </TabsTrigger>
                <TabsTrigger
                  value="taxes"
                  className="justify-start px-4 py-2 data-[state=active]:bg-[#F5F7FA] data-[state=active]:text-primary data-[state=active]:font-medium rounded-md text-left"
                >
                  <Percent className="h-4 w-4 mr-2" />
                  Tax Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="profile" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="john.doe@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(123) 456-7890" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="notifications" />
                    <Label htmlFor="notifications">
                      Enable email notifications for quote updates
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="company" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Manage your company details that appear on quotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" placeholder="Acme Gas Stations, Inc." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input id="website" placeholder="https://www.example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Business Phone</Label>
                      <Input id="businessPhone" placeholder="(123) 456-7890" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea id="address" placeholder="123 Main St, Suite 101&#10;San Diego, CA 92101" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <Input id="companyLogo" type="file" />
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 200x50px, PNG or JPG format
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Pricing Defaults</CardTitle>
                  <CardDescription>
                    Set default pricing for components used in quotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                        <SelectItem value="cad">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceFormat">Price Format</Label>
                    <Select defaultValue="comma">
                      <SelectTrigger id="priceFormat">
                        <SelectValue placeholder="Select price format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comma">1,234.56</SelectItem>
                        <SelectItem value="dot">1.234,56</SelectItem>
                        <SelectItem value="space">1 234,56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marginPercentage">Default Margin Percentage</Label>
                    <div className="relative">
                      <Input id="marginPercentage" type="number" placeholder="15" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="roundPrices" />
                    <Label htmlFor="roundPrices">
                      Round prices to nearest dollar
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="taxes" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Tax Settings</CardTitle>
                  <CardDescription>
                    Configure tax rates and settings for your quotes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultTaxRate">Default Tax Rate</Label>
                    <div className="relative">
                      <Input id="defaultTaxRate" type="number" step="0.1" placeholder="8.5" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input id="taxId" placeholder="123-45-6789" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="showTaxSeparately" defaultChecked />
                    <Label htmlFor="showTaxSeparately">
                      Show tax as separate line item on quotes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="taxExempt" />
                    <Label htmlFor="taxExempt">
                      Enable tax exemption option for quotes
                    </Label>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}