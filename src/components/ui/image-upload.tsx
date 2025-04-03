
import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { UploadIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string | null) => void;
  className?: string;
  label: string;
  preview?: boolean;
}

export const ImageUpload = ({
  value,
  onChange,
  className,
  label,
  preview = true,
}: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setLoading(false);
      const result = event.target?.result as string;
      onChange(result);
    };
    reader.onerror = () => {
      setLoading(false);
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
      
      {preview && value && (
        <div className="relative mt-2 rounded-md overflow-hidden border border-border h-40 w-full">
          <img 
            src={value}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className={cn(
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          <UploadIcon className="h-4 w-4 mr-2" />
          {loading ? "Uploading..." : `Upload ${label}`}
        </Button>
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
