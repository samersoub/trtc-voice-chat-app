"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Music, ShieldAlert, Coins, Bell, Trash2, RotateCcw, CheckCheck } from "lucide-react";
import { NotificationFeedService, NotificationType, FeedItem } from "@/services/NotificationFeedService";
import { cn } from "@/lib/utils";

const TypeIcon: React.FC<{ type: NotificationType }> = ({ type }) => {
  if (type === "music") return <Music className="text-blue-600" />;
  if (type === "moderation") return <ShieldAlert className="text-red-600" />;
  if (type === "economy") return <Coins className="text-amber-600" />;
  return <Bell className="text-gray-600" />;
};

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return `${ts}`;
  }
}

const Inbox: React.FC = () => {
  const [items, setItems] = React.useState<FeedItem[]>(() => NotificationFeedService.list());
  const [tab, setTab] = React.useState<NotificationType | "all">("all");

  const filtered = React.useMemo(() => {
    return tab === "all" ? items : items.filter((i) => i.type === tab);
  }, [items, tab]);

  const counts = React.useMemo<Record<NotificationType, number>>(() => {
    return {
      music: items.filter((i) => i.type === "music").length,
      moderation: items.filter((i) => i.type === "moderation").length,
      economy: items.filter((i) => i.type === "economy").length,
      system: items.filter((i) => i.type === "system").length,
    };
  }, [items]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-lg">Notifications</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setItems(NotificationFeedService.list())}>
              <RotateCcw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => { NotificationFeedService.markAllRead(tab === "all" ? undefined : tab); setItems(NotificationFeedService.list()); }}>
              <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
            </Button>
            <Button variant="destructive" size="sm" onClick={() => { NotificationFeedService.clearFeed(); setItems(NotificationFeedService.list()); }}>
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="flex flex-wrap gap-2">
              <TabsTrigger value="all" className={cn("min-w-[80px]")}>All <Badge className="ml-2">{items.length}</Badge></TabsTrigger>
              <TabsTrigger value="music" className="min-w-[100px]">Music <Badge className="ml-2">{counts.music}</Badge></TabsTrigger>
              <TabsTrigger value="moderation" className="min-w-[120px]">Moderation <Badge className="ml-2">{counts.moderation}</Badge></TabsTrigger>
              <TabsTrigger value="economy" className="min-w-[110px]">Economy <Badge className="ml-2">{counts.economy}</Badge></TabsTrigger>
              <TabsTrigger value="system" className="min-w-[100px]">System <Badge className="ml-2">{counts.system}</Badge></TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="mt-3">
              <ScrollArea className="h-[60vh] rounded-md border">
                <div className="p-3 space-y-3">
                  {filtered.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No notifications.</div>
                  ) : (
                    filtered.map((i) => (
                      <div key={i.id} className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                          <TypeIcon type={i.type} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{i.title}</div>
                            <Badge variant={i.type === "moderation" ? "destructive" : i.type === "economy" ? "secondary" : "outline"} className="text-xs capitalize">
                              {i.type}
                            </Badge>
                          </div>
                          {i.body && <div className="text-sm text-muted-foreground">{i.body}</div>}
                          <div className="text-xs text-muted-foreground mt-1">{formatTime(i.at)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <Separator className="my-3" />
          <div className="text-xs text-muted-foreground">
            Note: Economy entries are derived from transactions and shown as read; app events (music/moderation) come from the in-app feed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inbox;