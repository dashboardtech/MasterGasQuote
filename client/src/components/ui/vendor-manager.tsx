import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, PlusCircle, Edit, Star } from "lucide-react";
import { Vendor } from "@shared/schema";

interface VendorManagerProps {
  vendors: Vendor[];
  onChange: (vendors: Vendor[]) => void;
}

export function VendorManager({ vendors, onChange }: VendorManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVendorId, setCurrentVendorId] = useState<string | null>(null);
  const [vendorData, setVendorData] = useState<Partial<Vendor>>({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    specialties: [],
    certifications: [],
    ratings: 0
  });

  const specialtyOptions = [
    "Excavation", 
    "Concrete", 
    "Fuel Systems", 
    "Electrical", 
    "Plumbing", 
    "Construction", 
    "Environmental Services",
    "Engineering",
    "Permit Management"
  ];
  
  const certificationOptions = [
    "EPA Certified",
    "OSHA Certified",
    "State Licensed",
    "PEI Certified",
    "UL Certified",
    "API Certified"
  ];
  
  // Generate a unique ID for a new vendor
  const generateId = () => {
    return `vendor_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };
  
  const handleAddVendor = () => {
    if (!vendorData.name) return;
    
    if (isEditing && currentVendorId) {
      // Update existing vendor
      const updatedVendors = vendors.map(vendor => 
        vendor.id === currentVendorId ? { ...vendor, ...vendorData } : vendor
      );
      onChange(updatedVendors);
    } else {
      // Add new vendor
      const newVendor: Vendor = {
        id: generateId(),
        name: vendorData.name || "",
        contactName: vendorData.contactName || "",
        contactEmail: vendorData.contactEmail || "",
        contactPhone: vendorData.contactPhone || "",
        specialties: vendorData.specialties || [],
        certifications: vendorData.certifications || [],
        ratings: vendorData.ratings || 0
      };
      
      onChange([...vendors, newVendor]);
    }
    
    // Reset form and close dialog
    setVendorData({
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      specialties: [],
      certifications: [],
      ratings: 0
    });
    setIsEditing(false);
    setCurrentVendorId(null);
    setIsDialogOpen(false);
  };
  
  const handleEditVendor = (vendor: Vendor) => {
    setVendorData({
      name: vendor.name,
      contactName: vendor.contactName,
      contactEmail: vendor.contactEmail,
      contactPhone: vendor.contactPhone,
      specialties: vendor.specialties,
      certifications: vendor.certifications,
      ratings: vendor.ratings
    });
    setIsEditing(true);
    setCurrentVendorId(vendor.id);
    setIsDialogOpen(true);
  };
  
  const handleRemoveVendor = (id: string) => {
    const updatedVendors = vendors.filter(vendor => vendor.id !== id);
    onChange(updatedVendors);
  };
  
  const handleSpecialtyToggle = (specialty: string) => {
    const currentSpecialties = vendorData.specialties || [];
    const updatedSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    
    setVendorData({
      ...vendorData,
      specialties: updatedSpecialties
    });
  };
  
  const handleCertificationToggle = (certification: string) => {
    const currentCertifications = vendorData.certifications || [];
    const updatedCertifications = currentCertifications.includes(certification)
      ? currentCertifications.filter(c => c !== certification)
      : [...currentCertifications, certification];
    
    setVendorData({
      ...vendorData,
      certifications: updatedCertifications
    });
  };
  
  const handleRatingChange = (rating: number) => {
    setVendorData({
      ...vendorData,
      ratings: rating
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contractor & Vendor Management</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setIsEditing(false);
                  setCurrentVendorId(null);
                  setVendorData({
                    name: "",
                    contactName: "",
                    contactEmail: "",
                    contactPhone: "",
                    specialties: [],
                    certifications: [],
                    ratings: 0
                  });
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
                <DialogDescription>
                  Enter the details of the contractor or vendor for this project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name*</Label>
                    <Input 
                      id="vendorName" 
                      placeholder="Company Name" 
                      value={vendorData.name} 
                      onChange={(e) => setVendorData({...vendorData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person</Label>
                    <Input 
                      id="contactName" 
                      placeholder="Full Name" 
                      value={vendorData.contactName} 
                      onChange={(e) => setVendorData({...vendorData, contactName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      placeholder="contact@company.com" 
                      value={vendorData.contactEmail} 
                      onChange={(e) => setVendorData({...vendorData, contactEmail: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input 
                      id="contactPhone" 
                      placeholder="(555) 123-4567" 
                      value={vendorData.contactPhone} 
                      onChange={(e) => setVendorData({...vendorData, contactPhone: e.target.value})}
                    />
                  </div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {specialtyOptions.map(specialty => (
                      <Badge 
                        key={specialty}
                        variant={vendorData.specialties?.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleSpecialtyToggle(specialty)}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Certifications</Label>
                  <div className="flex flex-wrap gap-2">
                    {certificationOptions.map(certification => (
                      <Badge 
                        key={certification}
                        variant={vendorData.certifications?.includes(certification) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleCertificationToggle(certification)}
                      >
                        {certification}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRatingChange(rating)}
                        className="p-1"
                      >
                        <Star 
                          className={`h-6 w-6 ${rating <= (vendorData.ratings || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAddVendor}>
                  {isEditing ? "Save Changes" : "Add Vendor"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {vendors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Specialties</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div className="font-medium">{vendor.name}</div>
                    </TableCell>
                    <TableCell>
                      <div>{vendor.contactName}</div>
                      <div className="text-xs text-muted-foreground">{vendor.contactEmail}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {vendor.specialties.slice(0, 3).map(specialty => (
                          <Badge key={specialty} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                        {vendor.specialties.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{vendor.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <Star 
                            key={rating}
                            className={`h-4 w-4 ${rating <= (vendor.ratings || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditVendor(vendor)}
                        className="mr-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveVendor(vendor.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vendors or contractors added yet. Add vendors to manage your project collaborators.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}