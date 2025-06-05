// components/api-key-input.tsx
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface ApiKeyInputProps {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  isKeyLoaded: boolean;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, setApiKey, isKeyLoaded, isOpen, onOpenChange }) => {
  const [tempKey, setTempKey] = useState('');

  // Effect to initialize tempKey or clear it when dialog opens/closes
  useEffect(() => {
    if (isOpen && apiKey) {
      // Placeholder is "Enter new key to update", so keep tempKey empty for updates
      // If you want to prefill for editing, uncomment: setTempKey(apiKey);
      setTempKey('');
    } else if (!isOpen) {
      setTempKey(''); // Clear tempKey when dialog closes
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    if (tempKey.trim()) {
      const newKey = tempKey.trim();
      setApiKey(newKey);
      onOpenChange(false); // Close dialog
      toast.success(apiKey ? "API key updated successfully!" : "API key saved successfully!", {
        description: "Fetching your account information..."
      });
    }
  };

  const handleRemove = () => {
      setApiKey(null);
      setTempKey('');
      // The parent's useEffect might re-open it if !apiKey.
      // onOpenChange(true); // Optionally re-open immediately
  }

  // Don't render the dialog trigger until the key status is loaded
  if (!isKeyLoaded) {
      return null; // Or a loading placeholder
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage API Key</DialogTitle>
            <DialogDescription>
              {apiKey ? "Your API Key is set. You can update or remove it." : "You need an API key from the provider to use this chat application. Enter it below."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="api-key-modal" className="text-right">
                API Key
              </Label>
              <Input
                id="api-key-modal"
                type="password" // Use password type to obscure
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder={apiKey ? "Enter new key to update" : "Paste your API key here"}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center gap-2">
             {apiKey && (
                <Button type="button" variant="destructive" onClick={handleRemove}>
                    Remove Key
                </Button>
             )}
             <Button type="button" onClick={handleSave} disabled={!tempKey.trim()}>
              {apiKey ? "Update Key" : "Save Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};