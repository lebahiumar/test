// components/customization-dialog.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { SearchGroupId, searchGroups as allSearchGroupsConfig } from '@/lib/utils';
import { Settings, History, MessageSquareText, Mic, Globe, Book, YoutubeIcon, Code, Bot as BuddyIcon, Image as ImageIcon, FileText, Paperclip, KeyRound, RadioTower, Volume2, Brain, Gauge } from 'lucide-react';
import { toast } from 'sonner';

interface CustomizationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  // Feature toggles
  isChatHistoryFeatureEnabled: boolean;
  onToggleChatHistoryFeature: (enabled: boolean) => void;
  isTextToSpeechFeatureEnabled: boolean;
  onToggleTextToSpeechFeature: (enabled: boolean) => void;
  isSystemPromptButtonEnabled: boolean;
  onToggleSystemPromptButton: (enabled: boolean) => void;
  isAttachmentButtonEnabled: boolean;
  onToggleAttachmentButton: (enabled: boolean) => void;
  // Group toggles
  enabledSearchGroupIds: SearchGroupId[];
  onToggleSearchGroup: (groupId: SearchGroupId) => void;
  // API Keys
  elevenLabsApiKey: string | null;
  onSetElevenLabsApiKey: (key: string | null) => void;
  // TTS Provider
  ttsProvider: 'browser' | 'elevenlabs';
  onSetTtsProvider: (provider: 'browser' | 'elevenlabs') => void;
  // Browser TTS Settings
  browserTtsSpeed: number;
  onSetBrowserTtsSpeed: (speed: number) => void;
  // selectedBrowserTtsVoice: string;
  // onSetSelectedBrowserTtsVoice: (voiceURI: string) => void;
  // elevenLabsTtsSpeed: number;
  // onSetElevenLabsTtsSpeed: (speed: number) => void;
  // selectedElevenLabsVoiceId: string;
  // onSetSelectedElevenLabsVoiceId: (voiceId: string) => void;
}

const getGroupIcon = (groupId: SearchGroupId): React.ElementType => {
    const groupConfig = allSearchGroupsConfig.find(g => g.id === groupId);
    return groupConfig?.icon || Settings;
};

export const CustomizationDialog: React.FC<CustomizationDialogProps> = ({
  isOpen,
  onOpenChange,
  isChatHistoryFeatureEnabled,
  onToggleChatHistoryFeature,
  isTextToSpeechFeatureEnabled,
  onToggleTextToSpeechFeature,
  isSystemPromptButtonEnabled,
  onToggleSystemPromptButton,
  isAttachmentButtonEnabled,
  onToggleAttachmentButton,
  enabledSearchGroupIds,
  onToggleSearchGroup,
  elevenLabsApiKey,
  onSetElevenLabsApiKey,
  ttsProvider,
  onSetTtsProvider,
  browserTtsSpeed,
  onSetBrowserTtsSpeed,
}) => {
  const availableGroupsToCustomize = allSearchGroupsConfig.filter(g => g.show);
  const [tempElevenLabsKey, setTempElevenLabsKey] = useState(elevenLabsApiKey || '');

  const handleSaveElevenLabsKey = () => {
    onSetElevenLabsApiKey(tempElevenLabsKey.trim() || null);
    toast.success("ElevenLabs API Key updated.");
  };
  
  const handleRemoveElevenLabsKey = () => {
    onSetElevenLabsApiKey(null);
    setTempElevenLabsKey('');
    toast.info("ElevenLabs API Key removed.");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customization Settings
          </DialogTitle>
          <DialogDescription>
            Tailor your chat experience. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-3 -mr-3 dialog-custom-scrollbar">
          <div className="space-y-6 py-4">
            {/* Feature Toggles Section */}
            <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground"/>
                    Core Features
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="chat-history-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Enable Chat History
                        <p className="text-xs text-muted-foreground mt-0.5">Save and load past conversations.</p>
                    </Label>
                    <Switch id="chat-history-toggle" checked={isChatHistoryFeatureEnabled} onCheckedChange={onToggleChatHistoryFeature} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="system-prompt-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Show System Prompt Button
                        <p className="text-xs text-muted-foreground mt-0.5">Allow setting a system-level instruction.</p>
                    </Label>
                    <Switch id="system-prompt-toggle" checked={isSystemPromptButtonEnabled} onCheckedChange={onToggleSystemPromptButton} />
                </div>
                 <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="attachment-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Show Attachment Button
                        <p className="text-xs text-muted-foreground mt-0.5">Enable file and image attachments.</p>
                    </Label>
                    <Switch id="attachment-toggle" checked={isAttachmentButtonEnabled} onCheckedChange={onToggleAttachmentButton} />
                </div>
            </div>
            <Separator />

            {/* Text-to-Speech Section */}
             <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mic className="h-4 w-4 text-muted-foreground"/>
                    Text-to-Speech
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <Label htmlFor="tts-toggle" className="text-sm text-card-foreground cursor-pointer">
                        Enable Text-to-Speech Button
                         <p className="text-xs text-muted-foreground mt-0.5">Allow assistant messages to be read aloud.</p>
                    </Label>
                    <Switch id="tts-toggle" checked={isTextToSpeechFeatureEnabled} onCheckedChange={onToggleTextToSpeechFeature}/>
                </div>
                {isTextToSpeechFeatureEnabled && (
                    <div className="p-3 rounded-lg border bg-card space-y-3">
                        <Label className="text-sm text-card-foreground">TTS Provider</Label>
                        <Tabs value={ttsProvider} onValueChange={(value) => onSetTtsProvider(value as 'browser' | 'elevenlabs')}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="browser"><Volume2 className="mr-1.5 h-3.5 w-3.5"/>Browser</TabsTrigger>
                                <TabsTrigger value="elevenlabs"><RadioTower className="mr-1.5 h-3.5 w-3.5"/>ElevenLabs</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {ttsProvider === 'browser' && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="browser-tts-speed" className="text-xs text-muted-foreground">Browser TTS Speed</Label>
                                    <span className="text-xs text-foreground font-medium">{browserTtsSpeed.toFixed(1)}x</span>
                                </div>
                                <Slider
                                    id="browser-tts-speed"
                                    min={0.5}
                                    max={2}
                                    step={0.1}
                                    value={[browserTtsSpeed]}
                                    onValueChange={(value) => onSetBrowserTtsSpeed(value[0])}
                                />
                                <p className="text-[10px] text-muted-foreground">
                                    Adjust the playback speed for browser-based text-to-speech. Voice selection uses browser/OS defaults.
                                </p>
                            </div>
                        )}

                        {ttsProvider === 'elevenlabs' && (
                            <div className="space-y-2 pt-2">
                                <Label htmlFor="elevenlabs-api-key" className="text-xs text-muted-foreground">ElevenLabs API Key</Label>
                                <Input
                                    id="elevenlabs-api-key"
                                    type="password"
                                    value={tempElevenLabsKey}
                                    onChange={(e) => setTempElevenLabsKey(e.target.value)}
                                    placeholder="Enter your ElevenLabs API Key"
                                />
                                <div className="flex justify-end gap-2">
                                     <Button variant="ghost" size="sm" onClick={handleRemoveElevenLabsKey} disabled={!elevenLabsApiKey}>Remove</Button>
                                     <Button size="sm" onClick={handleSaveElevenLabsKey} disabled={tempElevenLabsKey === (elevenLabsApiKey || '') || !tempElevenLabsKey.trim()}>
                                        {elevenLabsApiKey ? 'Update Key' : 'Save Key'}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Get your API key from <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">elevenlabs.io</a>.
                                    Voice and speed settings for ElevenLabs coming soon.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <Separator />

            {/* Search Groups Toggles */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MessageSquareText className="h-4 w-4 text-muted-foreground"/>
                Enabled Search Groups
              </h4>
              <p className="text-xs text-muted-foreground -mt-2">Select which search modes are available in the input area.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableGroupsToCustomize.map((group) => {
                  const Icon = getGroupIcon(group.id);
                  return (
                    <div key={group.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <Label htmlFor={`group-toggle-${group.id}`} className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                        <Icon className="h-4 w-4 text-muted-foreground"/>
                        {group.name}
                      </Label>
                      <Switch
                        id={`group-toggle-${group.id}`}
                        checked={enabledSearchGroupIds.includes(group.id)}
                        onCheckedChange={() => onToggleSearchGroup(group.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

