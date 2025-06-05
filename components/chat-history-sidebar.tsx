
// components/chat-history-sidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, MessageSquareText, History, LogOut, AlertTriangle, Download } from 'lucide-react';
import { ChatHistoryEntry, formatRelativeTime, cn, SimpleMessage } from '@/lib/utils';
import { toast } from 'sonner';

interface ChatHistorySidebarProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  chatHistory: ChatHistoryEntry[];
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onClearAllHistory: () => void;
}

const exportChatToJson = (messages: SimpleMessage[], title: string, timestamp: number) => {
  try {
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9_.-]/g, '_').substring(0, 50) || "chat_export";
    const dateStr = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${sanitizedTitle}_${dateStr}.json`;
    
    const jsonStr = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Chat "${title}" exported successfully as ${filename}`);
  } catch (error) {
    console.error("Error exporting chat:", error);
    toast.error("Failed to export chat.");
  }
};

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  isOpen,
  onOpenChange,
  chatHistory,
  onLoadChat,
  onDeleteChat,
  onClearAllHistory,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5" />
            Chat History
          </SheetTitle>
          <SheetDescription className="text-xs">
            Your last {chatHistory.length > 0 ? Math.min(chatHistory.length, 10) : '0'} conversations. Click to load.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1 dialog-custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium text-muted-foreground">No chat history yet.</p>
              <p className="text-xs text-muted-foreground/70">Start a conversation to see it here.</p>
            </div>
          ) : (
            <div className="py-2 px-2 space-y-1.5">
              {chatHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="group relative flex items-center justify-between p-1 rounded-md hover:bg-accent dark:hover:bg-accent/50"
                >
                  <Button
                    variant="ghost"
                    className="w-full h-auto justify-start items-start text-left p-1.5 flex-1"
                    onClick={() => {
                      onLoadChat(entry.id);
                      onOpenChange(false); // Close sidebar on load
                    }}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className="text-xs font-medium text-foreground truncate block max-w-[180px] sm:max-w-[220px]">
                        {entry.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatRelativeTime(entry.timestamp)}
                      </span>
                    </div>
                  </Button>
                  <div className={cn(
                    "flex items-center shrink-0 transition-opacity duration-150",
                    "opacity-100 md:opacity-0 md:group-hover:opacity-100" 
                  )}>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          exportChatToJson(entry.messages, entry.title, entry.timestamp);
                        }}
                        aria-label="Export chat"
                        title="Export chat"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(entry.id);
                      }}
                      aria-label="Delete chat"
                       title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t space-y-2">
            {chatHistory.length > 0 && (
                 <Button
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear all chat history? This action cannot be undone.")) {
                            onClearAllHistory();
                            onOpenChange(false); 
                        }
                    }}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Clear All History
                </Button>
            )}
             <SheetClose asChild>
                <Button variant="outline" size="sm" className="w-full">
                    <LogOut className="mr-2 h-4 w-4 -rotate-180" /> Close
                </Button>
             </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};

ChatHistorySidebar.displayName = 'ChatHistorySidebar';

