
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Domain, DomainFile, DomainLink, DomainNote } from "@/types/domain";
import { addDomainLink, addDomainNote, deleteDomainLink, deleteDomainNote, deleteDomainFile, addDomainFile } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { EmptyState } from "../empty-state";
import { FileText, Link2, PaperclipIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ConfirmationDialog } from "../confirmation-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface DomainDetailTabsProps {
  domain: Domain;
  onUpdate: () => void;
}

export function DomainDetailTabs({ domain, onUpdate }: DomainDetailTabsProps) {
  const { toast } = useToast();
  
  // Notes state
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  
  // Links state
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  
  // Files state
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  
  // Note handlers
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setIsAddingNote(true);
    try {
      await addDomainNote(domain.id, newNote);
      setNewNote("");
      onUpdate();
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setIsAddingNote(false);
    }
  };
  
  const handleDeleteNote = async () => {
    if (!deletingNoteId) return;
    
    try {
      await deleteDomainNote(domain.id, deletingNoteId);
      onUpdate();
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete note",
        variant: "destructive",
      });
    } finally {
      setDeletingNoteId(null);
    }
  };
  
  // Link handlers
  const handleAddLink = async () => {
    if (!newLinkUrl.trim() || !newLinkTitle.trim()) return;
    
    setIsAddingLink(true);
    try {
      await addDomainLink(domain.id, newLinkUrl, newLinkTitle);
      setNewLinkUrl("");
      setNewLinkTitle("");
      setIsAddingLink(false);
      onUpdate();
      toast({
        title: "Success",
        description: "Link added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
    } finally {
      setIsAddingLink(false);
    }
  };
  
  const handleDeleteLink = async () => {
    if (!deletingLinkId) return;
    
    try {
      await deleteDomainLink(domain.id, deletingLinkId);
      onUpdate();
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    } finally {
      setDeletingLinkId(null);
    }
  };
  
  // File handlers
  const handleAddFile = async () => {
    if (!selectedFile) return;
    
    try {
      // In a real app, we would upload the file here
      await addDomainFile(
        domain.id,
        selectedFile.name,
        selectedFile.size,
        selectedFile.type
      );
      setSelectedFile(null);
      setIsAddingFile(false);
      onUpdate();
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteFile = async () => {
    if (!deletingFileId) return;
    
    try {
      await deleteDomainFile(domain.id, deletingFileId);
      onUpdate();
      toast({
        title: "Success",
        description: "File deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
        variant: "destructive",
      });
    } finally {
      setDeletingFileId(null);
    }
  };
  
  return (
    <Tabs defaultValue="notes" className="mt-6">
      <TabsList>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="links">Links</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      
      <TabsContent value="notes" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>
              Add notes and important information about this domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a new note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <Button 
                  onClick={handleAddNote} 
                  disabled={isAddingNote || !newNote.trim()}
                >
                  Add Note
                </Button>
              </div>
              
              <Separator />
              
              {domain.notes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No notes yet"
                  description="Notes you add will appear here"
                  className="py-8"
                />
              ) : (
                <div className="space-y-4">
                  {domain.notes.map((note: DomainNote) => (
                    <div key={note.id} className="rounded-lg border p-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(note.createdAt), "PPpp")}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingNoteId(note.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="links" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
            <CardDescription>
              Store important links related to this domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingLink(true)}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Link
            </Button>
            
            {domain.links.length === 0 ? (
              <EmptyState
                icon={Link2}
                title="No links yet"
                description="Links you add will appear here"
                className="py-8"
              />
            ) : (
              <div className="space-y-2">
                {domain.links.map((link: DomainLink) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center">
                      <Link2 className="h-5 w-5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium">{link.title}</h4>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-500 hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingLinkId(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="files" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>
              Upload and manage files related to this domain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => setIsAddingFile(true)}
              className="mb-4"
            >
              <Plus className="mr-2 h-4 w-4" /> Upload File
            </Button>
            
            {domain.files.length === 0 ? (
              <EmptyState
                icon={PaperclipIcon}
                title="No files yet"
                description="Files you upload will appear here"
                className="py-8"
              />
            ) : (
              <div className="space-y-2">
                {domain.files.map((file: DomainFile) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center">
                      <PaperclipIcon className="h-5 w-5 mr-2" />
                      <div>
                        <h4 className="text-sm font-medium">{file.fileName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {(file.fileSize / 1024).toFixed(2)} KB • {format(new Date(file.uploadedAt), "PP")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingFileId(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Add Link Dialog */}
      <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                placeholder="Link title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium">
                URL
              </label>
              <Input
                id="url"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingLink(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={!newLinkUrl.trim() || !newLinkTitle.trim()}>
              Add Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add File Dialog */}
      <Dialog open={isAddingFile} onOpenChange={setIsAddingFile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">
                Select File
              </label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingFile(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFile} disabled={!selectedFile}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={!!deletingNoteId}
        onClose={() => setDeletingNoteId(null)}
        onConfirm={handleDeleteNote}
        title="Delete Note"
        description="Are you sure you want to delete this note? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
      
      <ConfirmationDialog
        isOpen={!!deletingLinkId}
        onClose={() => setDeletingLinkId(null)}
        onConfirm={handleDeleteLink}
        title="Delete Link"
        description="Are you sure you want to delete this link? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
      
      <ConfirmationDialog
        isOpen={!!deletingFileId}
        onClose={() => setDeletingFileId(null)}
        onConfirm={handleDeleteFile}
        title="Delete File"
        description="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </Tabs>
  );
}
