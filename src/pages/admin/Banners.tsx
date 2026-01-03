"use client";

import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { BannerService, type Banner } from "@/services/BannerService";
import { showSuccess } from "@/utils/toast";

const BannersAdmin: React.FC = () => {
  const [items, setItems] = useState<Banner[]>(() => BannerService.list());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);

  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const resetForm = () => {
    setTitle("");
    setSub("");
    setImageUrl("");
    setLinkUrl("");
  };

  const startAdd = () => {
    setEditing(null);
    resetForm();
    setOpen(true);
  };

  const startEdit = (b: Banner) => {
    setEditing(b);
    setTitle(b.title);
    setSub(b.sub || "");
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || "");
    setOpen(true);
  };

  const save = () => {
    if (!title || !imageUrl) return;
    if (editing) {
      BannerService.update(editing.id, { title, sub, imageUrl, linkUrl });
      showSuccess("Banner updated");
    } else {
      BannerService.create({ title, sub, imageUrl, linkUrl });
      showSuccess("Banner added");
    }
    setItems(BannerService.list());
    setOpen(false);
    setEditing(null);
    resetForm();
  };

  const remove = (id: string) => {
    BannerService.remove(id);
    setItems(BannerService.list());
    showSuccess("Banner removed");
  };

  return (
    <AdminLayout title="Banners">
      <div className="flex justify-end mb-3">
        <Button onClick={startAdd}>Add Banner</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 && <div className="text-muted-foreground">No banners.</div>}
        {items.map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <div
              className="h-32 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${b.imageUrl})` }}
            />
            <CardHeader className="py-2">
              <CardTitle className="text-base">{b.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {b.sub && <div className="text-sm text-muted-foreground">{b.sub}</div>}
              {b.linkUrl && <div className="text-xs text-muted-foreground">Link: {b.linkUrl}</div>}
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(b)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(b.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Subtitle (optional)" value={sub} onChange={(e) => setSub(e.target.value)} />
            <Input placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Input placeholder="Link URL (optional)" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} />
          </div>
          <DialogFooter className="mt-3">
            <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white" onClick={save}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default BannersAdmin;