"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  Folder,
  File,
  MessageSquare,
  Upload,
  Download,
  Copy,
  Trash2,
  Plus,
  FolderPlus,
  Cloud,
  Send,
  Clock,
  HardDrive,
  Share2,
  RefreshCw,
  X,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  Eye,
  Grid,
  List,
  Search,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  children?: FolderType[];
  _count?: { files: number; messages: number };
}

interface FileType {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId: string | null;
  description: string | null;
  downloadCount: number;
  createdAt: string;
  folder?: FolderType;
}

interface MessageType {
  id: string;
  content: string;
  sender: string | null;
  folderId: string | null;
  isPublic: boolean;
  createdAt: string;
  folder?: FolderType;
}

type ViewMode = "grid" | "list";
type ActiveTab = "messages" | "files" | "folders";

// Utility functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Video;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("tar")) return Archive;
  if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("html")) return Code;
  return File;
}

function getFileColor(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "text-pink-500";
  if (mimeType.startsWith("video/")) return "text-purple-500";
  if (mimeType.startsWith("audio/")) return "text-green-500";
  if (mimeType.includes("pdf")) return "text-red-500";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "text-yellow-600";
  if (mimeType.includes("json") || mimeType.includes("javascript")) return "text-blue-500";
  return "text-gray-500";
}

export default function CloudVault() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>("messages");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form states
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  
  // Dialog states
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch data
  const fetchMessages = useCallback(async (folderId: string | null) => {
    try {
      const url = folderId ? `/api/messages?folderId=${folderId}` : "/api/messages";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setMessages(data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  const fetchFiles = useCallback(async (folderId: string | null) => {
    try {
      const url = folderId ? `/api/files?folderId=${folderId}` : "/api/files";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setFiles(data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, []);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      if (data.success) setFolders(data.folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  }, []);

  // Fetch all data function
  const loadAllData = useCallback(async (folderId: string | null) => {
    setLoading(true);
    await Promise.all([
      fetchMessages(folderId),
      fetchFiles(folderId),
      fetchFolders()
    ]);
    setLoading(false);
  }, [fetchMessages, fetchFiles, fetchFolders]);

  // Initial load - fetch data when component mounts
  useEffect(() => {
    // Data fetching on mount is a valid pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData(null);
  }, [loadAllData]);

  // Handle folder change - refetch when folder changes
  useEffect(() => {
    if (!loading && currentFolder !== undefined) {
      // Data fetching on folder change is a valid pattern
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchMessages(currentFolder?.id || null);
      fetchFiles(currentFolder?.id || null);
    }
  }, [currentFolder?.id]);

  // Handlers
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessage,
          sender: senderName || "Anonymous",
          folderId: currentFolder?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages([data.message, ...messages]);
        setNewMessage("");
        toast({ title: "Message sent!", description: "Your message has been posted publicly." });
      }
    } catch {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied!", description: "Message copied to clipboard" });
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/messages?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessages(messages.filter((m) => m.id !== id));
        toast({ title: "Deleted!", description: "Message has been deleted" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete message", variant: "destructive" });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName,
          parentId: currentFolder?.id,
          color: newFolderColor,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFolders([...folders, data.folder]);
        setNewFolderName("");
        setShowNewFolder(false);
        toast({ title: "Folder created!", description: `"${data.folder.name}" has been created` });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    }
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm("Are you sure? This will delete all files and messages in this folder!")) return;
    
    try {
      const res = await fetch(`/api/folders?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFolders(folders.filter((f) => f.id !== id));
        if (currentFolder?.id === id) setCurrentFolder(null);
        loadAllData(null);
        toast({ title: "Deleted!", description: "Folder and its contents have been deleted" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setUploading(true);
    const filesArray = Array.from(selectedFiles);
    try {
      for (const file of filesArray) {
        const formData = new FormData();
        formData.append("file", file);
        if (currentFolder) formData.append("folderId", currentFolder.id);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success) {
          setFiles((prev) => [data.file, ...prev]);
        }
      }
      setSelectedFiles(null);
      setShowUpload(false);
      toast({ title: "Upload complete!", description: `${filesArray.length} file(s) uploaded successfully` });
    } catch {
      toast({ title: "Error", description: "Failed to upload files", variant: "destructive" });
    }
    setUploading(false);
  };

  const handleDownload = (file: FileType) => {
    const link = document.createElement("a");
    link.href = `/api/download?id=${file.id}`;
    link.download = file.originalName;
    link.click();
    toast({ title: "Downloading...", description: file.originalName });
  };

  const handleDeleteFile = async (id: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const res = await fetch(`/api/files?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setFiles(files.filter((f) => f.id !== id));
        toast({ title: "Deleted!", description: "File has been deleted permanently" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    }
  };

  const handleCopyLink = (fileId: string) => {
    const url = `${window.location.origin}/api/download?id=${fileId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Share link copied to clipboard" });
  };

  const fetchAll = () => {
    loadAllData(currentFolder?.id || null);
  };

  // Filter based on search
  const filteredMessages = messages.filter((m) =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.sender?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredFiles = files.filter((f) =>
    f.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFolders = folders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const totalDownloads = files.reduce((acc, f) => acc + f.downloadCount, 0);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Cloud className="h-10 w-10 text-cyan-400" />
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    CloudVault
                  </h1>
                  <p className="text-xs text-slate-400">Public Cloud Storage & Messaging</p>
                </div>
              </div>

              {/* Search */}
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search messages, files, folders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchAll}
                      className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>

                <Dialog open={showUpload} onOpenChange={setShowUpload}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white gap-2">
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-slate-200">Upload Files</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div
                        className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                        <p className="text-slate-300 mb-2">Click to select files</p>
                        <p className="text-sm text-slate-500">or drag and drop</p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(e) => setSelectedFiles(e.target.files)}
                        />
                      </div>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <div className="bg-slate-700/50 rounded-lg p-4">
                          <p className="text-sm text-slate-300 mb-2">
                            {selectedFiles.length} file(s) selected:
                          </p>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {Array.from(selectedFiles).map((file, i) => (
                              <p key={i} className="text-sm text-slate-400 truncate">
                                {file.name} ({formatBytes(file.size)})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowUpload(false)}
                          className="flex-1 border-slate-600 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpload}
                          disabled={!selectedFiles || uploading}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="border-b border-slate-700/50 bg-slate-800/30">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-6 text-sm overflow-x-auto">
              <div className="flex items-center gap-2 text-slate-400">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                <span>{messages.length} Messages</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <File className="h-4 w-4 text-blue-400" />
                <span>{files.length} Files</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <HardDrive className="h-4 w-4 text-purple-400" />
                <span>{formatBytes(totalSize)} Used</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Download className="h-4 w-4 text-green-400" />
                <span>{totalDownloads} Downloads</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 ml-auto">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Publicly Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <Card className="bg-slate-800/50 border-slate-700 sticky top-32">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-200">Folders</CardTitle>
                    <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                          <FolderPlus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-slate-200">New Folder</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Folder name..."
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="bg-slate-700 border-slate-600 text-slate-200"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">Color:</span>
                            <input
                              type="color"
                              value={newFolderColor}
                              onChange={(e) => setNewFolderColor(e.target.value)}
                              className="h-8 w-8 rounded cursor-pointer"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowNewFolder(false)}
                              className="flex-1 border-slate-600 text-slate-300"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateFolder}
                              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <ScrollArea className="h-[calc(100vh-400px)]">
                    <div className="space-y-1">
                      <Button
                        variant={currentFolder === null ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 text-slate-300",
                          currentFolder === null && "bg-slate-700 text-slate-200"
                        )}
                        onClick={() => setCurrentFolder(null)}
                      >
                        <Home className="h-4 w-4" />
                        All Files & Messages
                      </Button>
                      {filteredFolders.map((folder) => (
                        <Button
                          key={folder.id}
                          variant={currentFolder?.id === folder.id ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-between text-slate-300 group",
                            currentFolder?.id === folder.id && "bg-slate-700 text-slate-200"
                          )}
                          onClick={() => setCurrentFolder(folder)}
                        >
                          <span className="flex items-center gap-2">
                            <Folder className="h-4 w-4" style={{ color: folder.color || "#6366f1" }} />
                            <span className="truncate">{folder.name}</span>
                          </span>
                          <span className="text-xs text-slate-500">
                            {folder._count?.files || 0}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </aside>

            {/* Main Panel */}
            <main className="flex-1 min-w-0">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg">
                  <Button
                    variant={activeTab === "messages" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("messages")}
                    className={cn(
                      activeTab === "messages" ? "bg-cyan-600 text-white" : "text-slate-400"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button
                    variant={activeTab === "files" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("files")}
                    className={cn(
                      activeTab === "files" ? "bg-cyan-600 text-white" : "text-slate-400"
                    )}
                  >
                    <File className="h-4 w-4 mr-2" />
                    Files
                  </Button>
                  <Button
                    variant={activeTab === "folders" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("folders")}
                    className={cn(
                      activeTab === "folders" ? "bg-cyan-600 text-white" : "text-slate-400"
                    )}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Folders
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="text-slate-400"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="text-slate-400"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Current Folder Header */}
              {currentFolder && (
                <div className="flex items-center gap-2 mb-4 p-3 bg-slate-800/30 rounded-lg">
                  <Folder className="h-5 w-5" style={{ color: currentFolder.color || "#6366f1" }} />
                  <span className="text-slate-300">{currentFolder.name}</span>
                  <Badge variant="outline" className="text-slate-400 border-slate-600">
                    {currentFolder.path}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentFolder(null)}
                    className="ml-auto text-slate-400"
                  >
                    <X className="h-4 w-4 mr-1" /> Clear
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500" />
                </div>
              ) : (
                <>
                  {/* Messages Tab */}
                  {activeTab === "messages" && (
                    <div className="space-y-4">
                      {/* New Message */}
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <div className="flex-1 space-y-3">
                              <Input
                                placeholder="Your name (optional)"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-200"
                              />
                              <Textarea
                                placeholder="Type your message here... It will be stored permanently and publicly visible."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="bg-slate-700 border-slate-600 text-slate-200 min-h-[100px]"
                              />
                            </div>
                            <Button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim()}
                              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white self-end"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Messages List */}
                      <div className="space-y-3">
                        {filteredMessages.length === 0 ? (
                          <div className="text-center py-20 text-slate-400">
                            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No messages yet</p>
                            <p className="text-sm">Be the first to send a message!</p>
                          </div>
                        ) : (
                          filteredMessages.map((message) => (
                            <Card key={message.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors group">
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium">
                                    {message.sender?.charAt(0).toUpperCase() || "A"}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-slate-200">
                                        {message.sender || "Anonymous"}
                                      </span>
                                      <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDate(message.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 whitespace-pre-wrap break-words">
                                      {message.content}
                                    </p>
                                    {message.folder && (
                                      <Badge variant="outline" className="mt-2 text-slate-400 border-slate-600">
                                        <Folder className="h-3 w-3 mr-1" />
                                        {message.folder.name}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleCopyMessage(message.content)}
                                          className="h-8 w-8 text-slate-400"
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Copy</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleDeleteMessage(message.id)}
                                          className="h-8 w-8 text-red-400 hover:text-red-300"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Delete</TooltipContent>
                                    </Tooltip>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Files Tab */}
                  {activeTab === "files" && (
                    <div>
                      {filteredFiles.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                          <File className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No files yet</p>
                          <p className="text-sm">Upload files to store them permanently!</p>
                        </div>
                      ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                          {filteredFiles.map((file) => {
                            const Icon = getFileIcon(file.mimeType);
                            return (
                              <Card key={file.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors group cursor-pointer">
                                <CardContent className="p-4">
                                  <div className="flex flex-col items-center text-center">
                                    <div className={cn("h-16 w-16 rounded-lg bg-slate-700/50 flex items-center justify-center mb-3", getFileColor(file.mimeType))}>
                                      <Icon className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm text-slate-200 truncate w-full mb-1" title={file.originalName}>
                                      {file.originalName}
                                    </p>
                                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDownload(file)}
                                            className="h-7 w-7 text-slate-400"
                                          >
                                            <Download className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Download</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleCopyLink(file.id)}
                                            className="h-7 w-7 text-slate-400"
                                          >
                                            <Share2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy Link</TooltipContent>
                                      </Tooltip>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteFile(file.id)}
                                            className="h-7 w-7 text-red-400"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Delete</TooltipContent>
                                      </Tooltip>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredFiles.map((file) => {
                            const Icon = getFileIcon(file.mimeType);
                            return (
                              <Card key={file.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-3">
                                    <div className={cn("h-10 w-10 rounded-lg bg-slate-700/50 flex items-center justify-center", getFileColor(file.mimeType))}>
                                      <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-slate-200 truncate">{file.originalName}</p>
                                      <div className="flex items-center gap-3 text-xs text-slate-500">
                                        <span>{formatBytes(file.size)}</span>
                                        <span className="flex items-center gap-1">
                                          <Download className="h-3 w-3" />
                                          {file.downloadCount}
                                        </span>
                                        <span>{formatDate(file.createdAt)}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDownload(file)}
                                        className="text-slate-400"
                                      >
                                        <Download className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleCopyLink(file.id)}
                                        className="text-slate-400"
                                      >
                                        <Share2 className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteFile(file.id)}
                                        className="text-red-400"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Folders Tab */}
                  {activeTab === "folders" && (
                    <div>
                      {filteredFolders.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                          <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">No folders yet</p>
                          <p className="text-sm mb-4">Create folders to organize your files!</p>
                          <Button
                            onClick={() => setShowNewFolder(true)}
                            className="bg-cyan-600 hover:bg-cyan-700"
                          >
                            <FolderPlus className="h-4 w-4 mr-2" />
                            Create Folder
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filteredFolders.map((folder) => (
                            <Card key={folder.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors group cursor-pointer">
                              <CardContent className="p-4">
                                <div className="flex flex-col items-center text-center">
                                  <Folder className="h-16 w-16 mb-3" style={{ color: folder.color || "#6366f1" }} />
                                  <p className="text-sm text-slate-200 font-medium truncate w-full mb-1">
                                    {folder.name}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {folder._count?.files || 0} files • {folder._count?.messages || 0} messages
                                  </p>
                                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentFolder(folder);
                                        setActiveTab("files");
                                      }}
                                      className="text-cyan-400"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      Open
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteFolder(folder.id);
                                      }}
                                      className="h-8 w-8 text-red-400"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                          <Card className="bg-slate-800/30 border-slate-700 border-dashed hover:border-slate-600 transition-colors cursor-pointer" onClick={() => setShowNewFolder(true)}>
                            <CardContent className="p-4">
                              <div className="flex flex-col items-center text-center justify-center h-full min-h-[140px]">
                                <Plus className="h-8 w-8 text-slate-500 mb-2" />
                                <p className="text-sm text-slate-400">New Folder</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-slate-700 bg-slate-900/95 backdrop-blur-xl">
          <div className="flex items-center justify-around py-2">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("messages")}
              className={cn("flex-col h-auto py-2", activeTab === "messages" ? "text-cyan-400" : "text-slate-400")}
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-xs mt-1">Messages</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("files")}
              className={cn("flex-col h-auto py-2", activeTab === "files" ? "text-cyan-400" : "text-slate-400")}
            >
              <File className="h-5 w-5" />
              <span className="text-xs mt-1">Files</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("folders")}
              className={cn("flex-col h-auto py-2", activeTab === "folders" ? "text-cyan-400" : "text-slate-400")}
            >
              <Folder className="h-5 w-5" />
              <span className="text-xs mt-1">Folders</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowUpload(true)}
              className="flex-col h-auto py-2 text-slate-400"
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs mt-1">Upload</span>
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
