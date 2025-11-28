import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";
import { Input } from "@/components/ui/input";

const Settings = () => {
  const nav = useNavigate();
  return (
    <ChatLayout title="Settings">
      <div className="mx-auto max-w-xl p-4">
        <Card>
          <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Current Password</div>
                <Input id="currentPwd" type="password" placeholder="Current password" />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">New Password</div>
                <Input id="newPwd" type="password" placeholder="New password (min 6)" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="default"
                onClick={async () => {
                  const current = (document.getElementById("currentPwd") as HTMLInputElement)?.value || "";
                  const next = (document.getElementById("newPwd") as HTMLInputElement)?.value || "";
                  if (!next || next.length < 6) {
                    showError("New password must be at least 6 characters");
                    return;
                  }
                  try {
                    await AuthService.changePassword(current, next);
                    showSuccess("Password updated");
                  } catch (e: any) {
                    showError(e.message || "Failed to change password");
                  }
                }}
                className="w-full sm:w-auto"
              >
                Change Password
              </Button>
            </div>
            <Button variant="outline" onClick={() => { AuthService.logout(); showSuccess("Logged out"); nav("/auth/login"); }}>
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Settings;