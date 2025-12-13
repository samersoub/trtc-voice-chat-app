import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatLayout from "@/components/chat/ChatLayout";
import { FriendRecommendationService, type FriendSuggestion } from "@/services/FriendRecommendationService";
import { AuthService } from "@/services/AuthService";
import { Users, UserPlus, ArrowLeft } from "lucide-react";

type Contact = { id: string; name: string; email?: string };

const Contacts = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<FriendSuggestion[]>([]);
  const currentUser = AuthService.getCurrentUser();

  const contacts = useMemo<Contact[]>(
    () => [
      { id: "1", name: "Alex Johnson", email: "alex@example.com" },
      { id: "2", name: "Sam Patel", email: "sam@example.com" },
    ],
    []
  );

  useEffect(() => {
    const loadRecommendations = async () => {
      if (currentUser?.id) {
        try {
          const suggestions = await FriendRecommendationService.getRecommendations(3);
          setRecommendations(suggestions);
        } catch (error) {
          console.error('Failed to load friend recommendations:', error);
        }
      }
    };

    loadRecommendations();
  }, [currentUser?.id]);

  return (
    <ChatLayout title="Contacts">
      <div className="mx-auto max-w-2xl p-4 space-y-4">
        <h1 className="text-2xl font-semibold">Contacts</h1>

        {/* Friend Recommendations Section */}
        {recommendations.length > 0 && (
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  توصيات لك
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/profile/friends/recommendations')}
                  className="text-blue-500 hover:text-blue-600"
                >
                  عرض الكل
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((suggestion) => (
                <div
                  key={suggestion.user.id}
                  className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/30 rounded-lg hover:bg-white/70 dark:hover:bg-black/40 transition-colors cursor-pointer"
                  onClick={() => navigate(`/profile/${suggestion.user.id}`)}
                >
                  <img
                    src={suggestion.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + suggestion.user.id}
                    alt={suggestion.user.name}
                    className="w-12 h-12 rounded-full border-2 border-blue-500/30"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{suggestion.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.reason}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        {Math.round(suggestion.matchScore * 100)}% توافق
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle add friend
                    }}
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Existing Contacts */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">جهات الاتصال</h2>
          {contacts.map(c => (
            <Card key={c.id}>
              <CardHeader><CardTitle className="text-base">{c.name}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{c.email}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ChatLayout>
  );
};

export default Contacts;