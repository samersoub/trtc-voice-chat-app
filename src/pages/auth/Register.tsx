import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";
import { validateUsername, validateEmail, validatePassword, validatePhone } from "@/utils/validators";

const Register = () => {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPwd] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  return (
    <ChatLayout title="دندنة شات • Register">
      <div className="p-6 max-w-sm mx-auto">
        <Card className="w-full border-amber-200">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">Create account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Phone (+966...)" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input type="password" placeholder="Password (min 6, letters+numbers)" value={password} onChange={e => setPwd(e.target.value)} />
            <Input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} />
            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white"
              onClick={async () => {
                const uErr = validateUsername(username);
                const eErr = validateEmail(email);
                const pErr = validatePassword(password);
                const phErr = validatePhone(phone);
                if (uErr || eErr || pErr || phErr) {
                  showError(uErr || eErr || pErr || phErr || "Validation error");
                  return;
                }
                try {
                  await AuthService.registerExtended(username, email, password, phone, imageFile);
                  showSuccess("Account created. Please verify your email.");
                  nav("/auth/login");
                } catch (e: any) {
                  showError(e.message || "Register failed");
                }
              }}
            >
              Continue
            </Button>
            <div className="text-sm text-muted-foreground">
              Already have an account? <Link to="/auth/login" className="underline">Log in</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default Register;