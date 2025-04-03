
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Domain } from "@/types/domain";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createDomain, updateDomain } from "@/lib/api";
import { CalendarIcon, PlusCircle, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DomainFormProps {
  domain?: Domain;
  mode: "create" | "edit";
}

export function DomainForm({ domain, mode }: DomainFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: domain?.name || "",
    registrar: domain?.registrar || "",
    registeredDate: domain?.registeredDate ? new Date(domain.registeredDate) : new Date(),
    expiryDate: domain?.expiryDate ? new Date(domain.expiryDate) : new Date(),
    autoRenew: domain?.autoRenew || false,
    nameservers: domain?.nameservers || ["", ""],
  });
  
  const handleAddNameserver = () => {
    setFormData({
      ...formData,
      nameservers: [...formData.nameservers, ""]
    });
  };
  
  const handleRemoveNameserver = (index: number) => {
    setFormData({
      ...formData,
      nameservers: formData.nameservers.filter((_, i) => i !== index)
    });
  };
  
  const handleNameserverChange = (value: string, index: number) => {
    const updatedNameservers = [...formData.nameservers];
    updatedNameservers[index] = value;
    setFormData({
      ...formData,
      nameservers: updatedNameservers
    });
  };
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    
    // Filter out empty nameservers
    const filteredNameservers = formData.nameservers.filter(ns => ns.trim() !== "");
    
    try {
      if (mode === "create") {
        const newDomain = await createDomain({
          name: formData.name,
          registrar: formData.registrar,
          registeredDate: formData.registeredDate.toISOString().split('T')[0],
          expiryDate: formData.expiryDate.toISOString().split('T')[0],
          autoRenew: formData.autoRenew,
          nameservers: filteredNameservers,
          status: "active",
        });
        
        toast({
          title: "Success",
          description: `Domain ${newDomain.name} has been created.`,
        });
        
        navigate(`/domains/${newDomain.id}`);
      } else if (domain) {
        const updatedDomain = await updateDomain(domain.id, {
          name: formData.name,
          registrar: formData.registrar,
          registeredDate: formData.registeredDate.toISOString().split('T')[0],
          expiryDate: formData.expiryDate.toISOString().split('T')[0],
          autoRenew: formData.autoRenew,
          nameservers: filteredNameservers,
        });
        
        toast({
          title: "Success",
          description: `Domain ${updatedDomain?.name} has been updated.`,
        });
        
        navigate(`/domains/${domain.id}`);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Domain Name</Label>
          <Input
            id="name"
            placeholder="example.com"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="registrar">Registrar</Label>
          <Input
            id="registrar"
            placeholder="GoDaddy, Namecheap, etc."
            value={formData.registrar}
            onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Registration Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.registeredDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.registeredDate ? format(formData.registeredDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.registeredDate}
                onSelect={(date) => date && setFormData({ ...formData, registeredDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Expiration Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !formData.expiryDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.expiryDate ? format(formData.expiryDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.expiryDate}
                onSelect={(date) => date && setFormData({ ...formData, expiryDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Nameservers</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddNameserver}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Add Nameserver
          </Button>
        </div>
        
        <div className="space-y-2">
          {formData.nameservers.length === 0 ? (
            <div className="text-sm text-muted-foreground">No nameservers added</div>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {formData.nameservers.map((ns, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`ns${index + 1}.example.com`}
                      value={ns}
                      onChange={(e) => handleNameserverChange(e.target.value, index)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveNameserver(index)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="auto-renew"
          checked={formData.autoRenew}
          onCheckedChange={(checked) => setFormData({ ...formData, autoRenew: checked })}
        />
        <Label htmlFor="auto-renew">Auto-renew enabled</Label>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Domain" : "Update Domain"}
        </Button>
      </div>
    </form>
  );
}
