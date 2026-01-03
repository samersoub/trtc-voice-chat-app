"use client";

import React, { useMemo, useState } from "react";
import ChatLayout from "@/components/chat/ChatLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { SmartMatchingService, type MatchingPreferences, type ScoredCandidate } from "@/services/SmartMatchingService";
import { useNavigate } from "react-router-dom";
import { showSuccess } from "@/utils/toast";

const regions = ["US", "AE", "SA", "EG"];

const Matching: React.FC = () => {
  const nav = useNavigate();
  const [prefs, setPrefs] = useState<MatchingPreferences>({
    interests: ["music", "gaming"],
    location: "AE",
    onlineTime: 3,
    minCompatibility: 0.5,
  });

  const [query, setQuery] = useState<string>(prefs.interests.join(", "));
  const [suggestions, setSuggestions] = useState<ScoredCandidate[]>(() => SmartMatchingService.suggest(prefs, 5));

  const runSearch = () => {
    const parsedInterests = query
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const nextPrefs = { ...prefs, interests: parsedInterests };
    setPrefs(nextPrefs);
    const list = SmartMatchingService.suggest(nextPrefs, 5);
    setSuggestions(list);
    showSuccess("Updated suggestions");
  };

  return (
    <ChatLayout title="Smart Matching">
      <div className="mx-auto max-w-3xl p-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label>Interests (comma separated)</Label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. music, gaming, travel" />
            </div>
            <div className="grid gap-2">
              <Label>Region</Label>
              <Select value={prefs.location} onValueChange={(v) => setPrefs({ ...prefs, location: v })}>
                <SelectTrigger className="h-9"><SelectValue placeholder="Select region" /></SelectTrigger>
                <SelectContent>
                  {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Online time (hours/day)</Label>
              <Input type="number" min={0} max={24} value={prefs.onlineTime} onChange={(e) => setPrefs({ ...prefs, onlineTime: parseInt(e.target.value || "0") })} />
            </div>
            <div className="grid gap-2">
              <Label>Minimum base compatibility</Label>
              <Input type="number" step="0.1" min={0} max={1} value={prefs.minCompatibility ?? 0} onChange={(e) => setPrefs({ ...prefs, minCompatibility: parseFloat(e.target.value || "0") })} />
            </div>
            <div>
              <Button onClick={runSearch}>Find Matches</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Suggestions</CardTitle></CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-sm text-muted-foreground">No suggestions found. Try adjusting preferences.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Interests overlap</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {suggestions.map((c) => {
                    const overlap = c.interests.filter(i => prefs.interests.map(x => x.toLowerCase()).includes(i.toLowerCase())).length;
                    return (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.location}</TableCell>
                        <TableCell>{overlap}</TableCell>
                        <TableCell>{(c.score * 100).toFixed(0)}%</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => {
                              const callId = SmartMatchingService.startPrivateCall("me", c.id);
                              nav(`/matching/call/${c.id}`, { state: { callId, candidate: c } });
                            }}
                          >
                            Start Private Call
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Matching;