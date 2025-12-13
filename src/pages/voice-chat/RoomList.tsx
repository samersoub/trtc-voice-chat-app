import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VoiceChatService } from "@/services/VoiceChatService";
import ChatLayout from "@/components/chat/ChatLayout";

const RoomList = () => {
  const [rooms, setRooms] = useState(VoiceChatService.listRooms());
  
  // Reload rooms every time component mounts or when returning from create room
  useEffect(() => {
    const loadRooms = () => {
      const updatedRooms = VoiceChatService.listRooms();
      setRooms(updatedRooms);
    };
    loadRooms();
    
    // Reload rooms every 3 seconds to catch new rooms from DB
    const interval = setInterval(loadRooms, 3000);
    return () => clearInterval(interval);
  }, []);
  return (
    <ChatLayout title="Rooms">
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Rooms</h1>
          <Button asChild><Link to="/voice/create">Create room</Link></Button>
        </div>
        <div className="grid gap-3">
          {rooms.length === 0 && <div className="text-muted-foreground">No rooms yet. Create one!</div>}
          {rooms.map(r => (
            <Card key={r.id}>
              <CardHeader><CardTitle className="text-base">{r.name}</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">{r.participants.length} participant(s)</div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline"><Link to={`/voice/rooms/${r.id}`}>Details</Link></Button>
                  <Button asChild size="sm"><Link to={`/voice/rooms/${r.id}/join?autoJoin=1`}>Join</Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ChatLayout>
  );
};

export default RoomList;