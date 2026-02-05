 import { useState, useMemo } from "react";
 import { Input } from "@/components/ui/input";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import {
   Popover,
   PopoverContent,
   PopoverTrigger,
 } from "@/components/ui/popover";
 import { Search, Plus, X, ChevronDown } from "lucide-react";
 import { cn } from "@/lib/utils";
 
 interface Tag {
   id: string;
   name: string;
   category?: string | null;
   description?: string | null;
 }
 
 interface TagGroup {
   label: string;
   color: string;
   tags: Tag[];
   selectedIds: string[];
   onToggle: (id: string) => void;
 }
 
 interface TagSearchPickerProps {
   groups: TagGroup[];
   className?: string;
 }
 
 export function TagSearchPicker({ groups, className }: TagSearchPickerProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const [openGroup, setOpenGroup] = useState<string | null>(null);
 
   // Get all selected tags across all groups for display
   const allSelectedTags = useMemo(() => {
     return groups.flatMap((group) =>
       group.selectedIds.map((id) => {
         const tag = group.tags.find((t) => t.id === id);
         return tag ? { ...tag, groupLabel: group.label, groupColor: group.color, onToggle: group.onToggle } : null;
       }).filter(Boolean)
     );
   }, [groups]);
 
   return (
     <div className={cn("space-y-3", className)}>
       {/* Selected Tags Display */}
       {allSelectedTags.length > 0 && (
         <div className="flex flex-wrap gap-1.5">
           {allSelectedTags.map((tag) => (
             <Badge
               key={tag!.id}
               variant="secondary"
               className={cn(
                 "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                 tag!.groupColor
               )}
               onClick={() => tag!.onToggle(tag!.id)}
             >
               {tag!.name}
               <X className="w-3 h-3 ml-1" />
             </Badge>
           ))}
         </div>
       )}
 
       {/* Tag Group Pickers */}
       <div className="grid grid-cols-2 gap-2">
         {groups.map((group) => (
           <TagGroupPicker
             key={group.label}
             group={group}
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
             isOpen={openGroup === group.label}
             onOpenChange={(open) => setOpenGroup(open ? group.label : null)}
           />
         ))}
       </div>
     </div>
   );
 }
 
 interface TagGroupPickerProps {
   group: TagGroup;
   searchQuery: string;
   setSearchQuery: (q: string) => void;
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 function TagGroupPicker({
   group,
   searchQuery,
   setSearchQuery,
   isOpen,
   onOpenChange,
 }: TagGroupPickerProps) {
   const filteredTags = useMemo(() => {
     if (!searchQuery) return group.tags;
     const query = searchQuery.toLowerCase();
     return group.tags.filter(
       (tag) =>
         tag.name.toLowerCase().includes(query) ||
         tag.category?.toLowerCase().includes(query) ||
         tag.description?.toLowerCase().includes(query)
     );
   }, [group.tags, searchQuery]);
 
   const unselectedTags = filteredTags.filter(
     (tag) => !group.selectedIds.includes(tag.id)
   );
 
   const selectedCount = group.selectedIds.length;
 
   return (
     <Popover open={isOpen} onOpenChange={onOpenChange}>
       <PopoverTrigger asChild>
         <Button
           variant="outline"
           size="sm"
           className="w-full justify-between h-9 text-xs"
         >
           <span className="flex items-center gap-1.5">
             <Plus className="w-3 h-3" />
             {group.label}
             {selectedCount > 0 && (
               <Badge variant="secondary" className="ml-1 px-1.5 py-0 h-4 text-[10px]">
                 {selectedCount}
               </Badge>
             )}
           </span>
           <ChevronDown className="w-3 h-3 opacity-50" />
         </Button>
       </PopoverTrigger>
       <PopoverContent className="w-64 p-0" align="start">
         <div className="p-2 border-b">
           <div className="relative">
             <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
             <Input
               placeholder={`Search ${group.label.toLowerCase()}...`}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="h-8 pl-7 text-xs"
               autoFocus
             />
           </div>
         </div>
         <ScrollArea className="h-48">
           <div className="p-1">
             {unselectedTags.length === 0 ? (
               <p className="text-xs text-muted-foreground p-3 text-center">
                 {searchQuery ? "No matches found" : "All tags selected"}
               </p>
             ) : (
               unselectedTags.map((tag) => (
                 <Button
                   key={tag.id}
                   variant="ghost"
                   size="sm"
                   className="w-full justify-start text-xs h-8 px-2"
                   onClick={() => {
                     group.onToggle(tag.id);
                     setSearchQuery("");
                   }}
                 >
                   <div className="flex flex-col items-start">
                     <span>{tag.name}</span>
                     {tag.category && (
                       <span className="text-[10px] text-muted-foreground">
                         {tag.category}
                       </span>
                     )}
                   </div>
                 </Button>
               ))
             )}
           </div>
         </ScrollArea>
       </PopoverContent>
     </Popover>
   );
 }