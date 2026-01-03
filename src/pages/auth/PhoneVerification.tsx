import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AuthService } from "@/services/AuthService";
import { showError, showSuccess } from "@/utils/toast";
import ChatLayout from "@/components/chat/ChatLayout";

const PhoneVerification = () => {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  return (
    <ChatLayout title="Verify Phone">
      <div className="p-6 max-w-sm mx-auto">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Verify phone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Enter 6-digit code (hint: 123456)</div>
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="flex-1"
                onClick={() => {
                  const ok = AuthService.verifyPhone(code);
                  if (ok) {
                    showSuccess("Phone verified");
                    nav("/voice/rooms");
                  } else {
                    showError("Invalid code");
                  }
                }}
              >
                Verify
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  // Demo resend
                  setCode("");
                  showSuccess("Code resent: 123456");
                }}
              >
                Resend
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ChatLayout>
  );
};

export default PhoneVerification;