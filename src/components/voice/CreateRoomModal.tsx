"use client";

import React, { useState } from "react";
import { Camera, Loader2, Lock, Globe, Users, Hash, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (roomData: RoomCreationData) => Promise<void>;
}

export interface RoomCreationData {
  name: string;
  topic: string;
  privacy: "public" | "private";
  maxParticipants: number;
  thumbnail?: File | string;
}

const ROOM_TOPICS = [
  { value: "general", label: "عام - General Chat", icon: "💬" },
  { value: "music", label: "موسيقى - Music", icon: "🎵" },
  { value: "gaming", label: "ألعاب - Gaming", icon: "🎮" },
  { value: "education", label: "تعليم - Education", icon: "📚" },
  { value: "business", label: "أعمال - Business", icon: "💼" },
  { value: "entertainment", label: "ترفيه - Entertainment", icon: "🎬" },
  { value: "sports", label: "رياضة - Sports", icon: "⚽" },
  { value: "technology", label: "تقنية - Technology", icon: "💻" },
  { value: "art", label: "فن - Art & Design", icon: "🎨" },
  { value: "other", label: "أخرى - Other", icon: "✨" },
];

const PARTICIPANT_OPTIONS = [5, 10, 20, 50, 100];

const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [roomName, setRoomName] = useState("");
  const [topic, setTopic] = useState("general");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, thumbnail: "Image size must be less than 5MB" });
        return;
      }
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors({ ...errors, thumbnail: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!roomName.trim()) {
      newErrors.name = "Room name is required";
    } else if (roomName.trim().length < 3) {
      newErrors.name = "Room name must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onCreate({
        name: roomName.trim(),
        topic,
        privacy,
        maxParticipants,
        thumbnail: thumbnail || undefined,
      });
      handleReset();
      onClose();
    } catch (error) {
      console.error("Failed to create room:", error);
      setErrors({ submit: "Failed to create room. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRoomName("");
    setTopic("general");
    setPrivacy("public");
    setMaxParticipants(20);
    setThumbnail(null);
    setThumbnailPreview("");
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      handleReset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            إنشاء غرفة جديدة
          </DialogTitle>
          <DialogDescription>
            Create a new voice chat room and invite your friends
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="roomName" className="text-sm font-semibold">
              Room Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="roomName"
                placeholder="Enter room name..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className={cn(
                  "pl-10",
                  errors.name && "border-red-500 focus-visible:ring-red-500"
                )}
                maxLength={50}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
            <p className="text-xs text-gray-500">
              {roomName.length}/50 characters
            </p>
          </div>

          {/* Room Topic */}
          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-semibold">
              Room Topic
            </Label>
            <Select value={topic} onValueChange={setTopic}>
              <SelectTrigger id="topic">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOM_TOPICS.map((topicOption) => (
                  <SelectItem key={topicOption.value} value={topicOption.value}>
                    <span className="flex items-center gap-2">
                      <span>{topicOption.icon}</span>
                      <span>{topicOption.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Privacy Settings</Label>
            <RadioGroup
              value={privacy}
              onValueChange={(value) => setPrivacy(value as "public" | "private")}
              className="grid grid-cols-2 gap-3"
            >
              <div>
                <RadioGroupItem
                  value="public"
                  id="public"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="public"
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    privacy === "public"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Globe className={cn(
                    "h-6 w-6",
                    privacy === "public" ? "text-blue-500" : "text-gray-400"
                  )} />
                  <div className="text-center">
                    <p className="font-semibold text-sm">Public</p>
                    <p className="text-xs text-gray-500">Anyone can join</p>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="private"
                  id="private"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="private"
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-all",
                    "hover:bg-gray-50 dark:hover:bg-gray-800",
                    privacy === "private"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700"
                  )}
                >
                  <Lock className={cn(
                    "h-6 w-6",
                    privacy === "private" ? "text-purple-500" : "text-gray-400"
                  )} />
                  <div className="text-center">
                    <p className="font-semibold text-sm">Private</p>
                    <p className="text-xs text-gray-500">Invite only</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="maxParticipants" className="text-sm font-semibold">
              Maximum Participants
            </Label>
            <Select
              value={maxParticipants.toString()}
              onValueChange={(value) => setMaxParticipants(parseInt(value))}
            >
              <SelectTrigger id="maxParticipants">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {PARTICIPANT_OPTIONS.map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} participants
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail" className="text-sm font-semibold">
              Room Thumbnail (Optional)
            </Label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>

              {/* Upload button */}
              <div className="flex-1">
                <input
                  type="file"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  aria-label="Upload room thumbnail"
                  title="Upload thumbnail image"
                />
                <Label
                  htmlFor="thumbnail"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <Camera className="h-4 w-4" />
                  <span className="text-sm">
                    {thumbnail ? "Change Image" : "Upload Image"}
                  </span>
                </Label>
                {errors.thumbnail && (
                  <p className="text-xs text-red-500 mt-1">{errors.thumbnail}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB (JPG, PNG)
                </p>
              </div>
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isLoading || !roomName.trim()}
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 text-white min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Create Room
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
