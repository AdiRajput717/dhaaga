"use client";

import { GoogleLogin } from "@react-oauth/google";
import { googleLogin } from "@/lib/api/auth";

type GoogleLoginButtonProps = {
  onSuccess?: () => void;
};

export default function GoogleLoginButton({
  onSuccess,
}: GoogleLoginButtonProps) {
  const handleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("Google credential was not received");
      }

      await googleLogin(credentialResponse.credential);

      onSuccess?.();
    } catch (error) {
      console.error("Google login failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Google login failed"
      );
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => {
        console.error("Google login failed");
        alert("Google login failed");
      }}
    />
  );
}