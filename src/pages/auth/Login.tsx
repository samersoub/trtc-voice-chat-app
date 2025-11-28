import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";

const Login = () => {
  const nav = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPwd] = useState("");
  return (
    <ChatLayout title="دندنة شات • Login">
      <div className="p-6 max-w-sm mx-auto">
        <Card className="w-full border-amber-200">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Email or Username" value={login} onChange={e => setLogin(e.target.value)} />
            <Input type="password" placeholder="Password" value={password} onChange={e => setPwd(e.target.value)} />
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              onClick={async () => {
                try {
                  await AuthService.loginUnified(login, password);
                  showSuccess("Logged in");
                  // Redirect to Index page after login
                  nav("/");
                } catch (e: any) {
                  showError(e.message || "Login failed");
                }
              }}
            >
              Continue
            </Button>
            <div className="text-sm text-muted-foreground flex items-center justify-between">
              <span>
                New here? <Link to="/auth/register" className="underline">Create an account</Link>
              </span>
              <Link to="/auth/forgot" className="underline">Forgot password?</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Login;