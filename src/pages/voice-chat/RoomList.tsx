import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceChatService } from "@/services/VoiceChatService";
import { RoomParticipantService } from "@/services/RoomParticipantService";
import { supabase, isSupabaseReady } from "@/services/db/supabaseClient";
import { Users } from "lucide-react";
import ChatLayout from "@/components/chat/ChatLayout";

interface RoomWithCount {
  id: string;
  name: string;
  participants: string[];
  participantCount?: number;
  isPrivate?: boolean;
  description?: string;
  background?: string;
}

const RoomList = () => {
  const [rooms, setRooms] = useState<RoomWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load rooms with real-time participant counts
  const loadRooms = async () => {
    const localRooms = VoiceChatService.listRooms();
    
    // إذا كان Supabase جاهزاً، احصل على عدد المشاركين من قاعدة البيانات
    if (isSupabaseReady && supabase) {
      const { data: dbRooms } = await supabase
        .from('voice_rooms')
        .select('id, name, current_participants, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (dbRooms) {
        // دمج البيانات من localStorage و Supabase
        const roomsWithCounts = localRooms.map(room => {
          const dbRoom = dbRooms.find(r => r.id === room.id);
          return {
            ...room,
            participantCount: dbRoom?.current_participants || room.participants.length,
          };
        });
        
        setRooms(roomsWithCounts);
        setLoading(false);
        return;
      }
    }
    
    // Fallback: استخدم البيانات من localStorage فقط
    setRooms(localRooms.map(r => ({ ...r, participantCount: r.participants.length })));
    setLoading(false);
  };
  
  useEffect(() => {
    loadRooms();
    
    // Reload rooms every 3 seconds to catch new rooms and participant updates
    const interval = setInterval(loadRooms, 3000);
    
    // Subscribe to real-time updates من Supabase
    let subscription: any = null;
    if (isSupabaseReady && supabase) {
      subscription = supabase
        .channel('room_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'voice_rooms',
          },
          () => {
            loadRooms();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'room_participants',
          },
          () => {
            loadRooms();
          }
        )
        .subscribe();
    }
    
    return () => {
      clearInterval(interval);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);
  return (
    <ChatLayout title="الغرف الصوتية">
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">الغرف الصوتية</h1>
          <Button asChild><Link to="/voice/create">إنشاء غرفة</Link></Button>
        </div>
        
        {loading && (
          <div className="text-center text-muted-foreground py-8">
            جاري التحميل...
          </div>
        )}
        
        <div className="grid gap-3">
          {!loading && rooms.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              لا توجد غرف نشطة حالياً. قم بإنشاء غرفة جديدة!
            </div>
          )}
          
          {!loading && rooms.map(r => (
            <Card key={r.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.name}</CardTitle>
                  {r.isPrivate && (
                    <Badge variant="secondary" className="text-xs">خاصة</Badge>
                  )}
                </div>
                {r.description && (
                  <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {r.participantCount || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {r.participantCount === 1 ? 'مستخدم' : 'مستخدمين'}
                  </span>
                  {r.participantCount === 0 && (
                    <Badge variant="outline" className="text-xs mr-2">فارغة</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/voice/rooms/${r.id}`}>التفاصيل</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to={`/voice/rooms/${r.id}/join?autoJoin=1`}>انضمام</Link>
                  </Button>
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