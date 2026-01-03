"use client";

import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { MusicService } from "@/services/MusicService";
import { MusicPermissionsService } from "@/services/MusicPermissionsService";
import { MusicTrack } from "@/models/MusicTrack";
import { showSuccess, showError } from "@/utils/toast";
import { EconomyService } from "@/services/EconomyService";

const SongRequestPanel: React.FC<{ roomId: string; userId: string }> = ({ roomId, userId }) => {
  const categories = MusicService.getCategories();
  const playlists = MusicService.getPlaylists();
  const [activeCat, setActiveCat] = useState<string>(categories[0]?.key ?? "pop");
  const [queue, setQueue] = useState(MusicService.getQueue(roomId));
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [vip, setVip] = useState(false);
  const role = MusicPermissionsService.getRole(roomId, userId);

  const canRequest = MusicPermissionsService.canRequest(roomId, userId);
  const canApprove = MusicPermissionsService.canApprove(roomId, userId);

  const st = MusicService.getRoomMusic(roomId);

  const applySpotifyConfig = () => {
    const clientId = prompt("Spotify Client ID") || "";
    const clientSecret = prompt("Spotify Client Secret") || "";
    if (!clientId || !clientSecret) {
      showError("Spotify config not set");
      return;
    }
    MusicService.setSpotifyConfig({ clientId, clientSecret });
    showSuccess("Spotify configured");
  };

  const onRequest = () => {
    if (!canRequest) {
      showError("You don't have permission to request songs");
      return;
    }
    if (!title) {
      showError("Enter a song title");
      return;
    }
    if (vip) {
      // Deduct VIP cost (10 coins)
      EconomyService.spendCoins(10, { feature: "vip-request", roomId, userId });
    }
    const track: MusicTrack = {
      id: `s_${Math.random().toString(36).slice(2, 10)}`,
      title,
      artist: artist || undefined,
      url: url || undefined,
      source: url ? "url" : "spotify",
    };
    const next = MusicService.addRequest(roomId, track, userId, vip);
    setQueue(next);
    setTitle("");
    setArtist("");
    setUrl("");
    setVip(false);
    showSuccess("Song requested");
  };

  return (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Song Requests</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={applySpotifyConfig}>Spotify</Button>
            {canApprove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  MusicService.clearQueue(roomId);
                  setQueue([]);
                  showSuccess("Queue cleared");
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={activeCat} onValueChange={(v) => setActiveCat(v)}>
          <TabsList className="w-full justify-start flex-wrap">
            {categories.map((c) => (
              <TabsTrigger key={c.key} value={c.key} style={{ borderBottomColor: c.color }}>
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((c) => (
            <TabsContent key={c.key} value={c.key} className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                {playlists.map((pl) => (
                  <div key={pl.id} className="rounded border p-2">
                    <div className="text-sm font-semibold">{pl.name}</div>
                    <div className="text-xs text-muted-foreground">{pl.vipOnly ? "VIP Only" : "Public"}</div>
                    <div className="mt-2 grid gap-1">
                      {pl.tracks.slice(0, 2).map((t) => (
                        <div key={t.id} className="flex items-center justify-between">
                          <div className="text-xs">{t.title}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (vip) {
                                EconomyService.spendCoins(10, { feature: "vip-request", roomId, userId, from: "playlist" });
                              }
                              const next = MusicService.addRequest(roomId, t, userId, vip);
                              setQueue(next);
                              showSuccess("Requested from playlist");
                            }}
                          >
                            Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="grid gap-2">
          <Input placeholder="Song title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Artist (optional)" value={artist} onChange={(e) => setArtist(e.target.value)} />
          <Input placeholder="Direct URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">VIP priority (adds +2 votes)</div>
            <Button variant={vip ? "default" : "outline"} size="sm" onClick={() => setVip((v) => !v)}>
              {vip ? "VIP Enabled" : "Enable VIP"}
            </Button>
          </div>
          <div className="text-[11px] text-muted-foreground">
            {vip ? "Cost: 10 coins" : "Enable VIP to prioritize your request (10 coins)"}
          </div>
          <Button onClick={onRequest}>Request Song</Button>
        </div>

        <div className="rounded border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Song</TableHead>
                <TableHead>Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-xs text-muted-foreground">No requests yet.</TableCell>
                </TableRow>
              ) : (
                queue.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.track.title}</TableCell>
                    <TableCell>{r.votes}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const next = MusicService.vote(roomId, r.id, userId, 5, true);
                          setQueue(next);
                          showSuccess("Voted");
                        }}
                      >
                        Vote
                      </Button>
                      {canApprove && !r.approved && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const next = MusicService.approve(roomId, r.id);
                            setQueue(next);
                            showSuccess("Approved and playing");
                          }}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded border p-2">
          <div className="text-xs text-muted-foreground">Volume</div>
          <Slider
            defaultValue={[Math.round((st.volume ?? 0.8) * 100)]}
            onValueChange={(v) => {
              const vol = (v[0] ?? 80) / 100;
              MusicService.setVolume(roomId, vol);
              showSuccess(`Volume: ${Math.round(vol * 100)}%`);
            }}
          />
        </div>

        <div className="text-xs text-muted-foreground">Role: {role}</div>
      </CardContent>
    </Card>
  );
};

export default SongRequestPanel;