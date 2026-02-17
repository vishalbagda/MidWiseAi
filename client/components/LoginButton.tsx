import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

// Google Icon Component
const GoogleIcon = () => (
  <svg 
    className="mr-2 h-4 w-4" 
    aria-hidden="true" 
    focusable="false" 
    data-prefix="fab" 
    data-icon="google" 
    role="img" 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 488 512"
  >
    <path 
      fill="currentColor" 
      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
    ></path>
  </svg>
);

export default function LoginButton() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // We need to exchange the access_token for an id_token or user info on the server
        // BUT, the existing server implementation expects an 'credential' (idToken) from the Google Sign-In button
        // The useGoogleLogin hook returns an access_token by default (Implicit Flow) which is different.
        // To make this work with our existing backend, we need to ask for 'id_token' flow or fetch user info here.
        
        // HOWEVER, to keep it simple and consistent with the previous implementation which expected 'credential',
        // we should switch flow to 'auth-code' or just use the access_token to fetch user info on client and send to server.
        // Let's stick to the previous 'credential' (JWT) approach if possible, but useGoogleLogin default flow is 'implicit'.
        
        // BETTER APPROACH for custom UI:
        // Use the 'flow: implicit' (default) and get the access_token.
        // Then, we need to update the backend to accept access_token OR fetch the user profile here and send it.
        // OR: We can use 'flow: auth-code' and exchange code on backend.
        
        // WAIT: The previous implementation used `GoogleLogin` which returns an ID Token (credential).
        // `useGoogleLogin` with `flow: 'implicit'` returns `access_token`.
        // `useGoogleLogin` does NOT return an ID token directly in the same way.
        
        // Let's fetch the user info using the access_token on the client side, 
        // then send the relevant data to our backend to create a session.
        // OR, even better, update the backend to verify the access_token.
        
        // Let's try to fetch the minimal info we need to match the previous flow.
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        
        if (!userInfoResponse.ok) throw new Error("Failed to fetch Google profile");
        
        const userInfo = await userInfoResponse.json();
        
        // Now construct a "credential" payload or just call a new login method.
        // Since we can't easily generate a signed JWT (idToken) on the client to match the exact previous 'credential',
        // it might be safer to update the backend to accept this new format or separate endpoint.
        
        // COMPROMISE: Let's create a *new* login method in useAuth that accepts the user info directly
        // OR update the existing login to handle this.
        
        // Let's update useAuth to handle this 'userInfo' object.
        // Actually, the simplest way to get an ID Token with useGoogleLogin is to NOT use it if we want ID tokens easily
        // without backend changes.
        // But we WANT custom UI.
        
        // Let's modify the plan:
        // 1. Fetch user info here.
        // 2. Send { googleId, email, name, picture } to a NEW backend endpoint '/api/auth/google-custom' 
        //    (This is less secure than verifying ID token on backend, but for a prototype it's fine. 
        //     Ideally we send the access_token to backend and backend fetches user info to verify).
        
        // SECURE APPROACH:
        // 1. Send access_token to backend.
        // 2. Backend validates access_token with Google and gets user info.
        // 3. Backend creates session.
        
        // Let's go with the SECURE APPROACH. I'll need to update `auth.ts` schema slightly or just the logic.
        
        await login(tokenResponse.access_token, "access_token"); 
        toast.success("Logged in successfully!");
      } catch (error) {
        console.error(error);
        toast.error("Failed to login with Google");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log("Login Failed");
      toast.error("Google Login failed");
      setIsLoading(false);
    },
  });

  return (
    <Button 
      onClick={() => {
        setIsLoading(true);
        googleLogin();
      }}
      variant="outline"
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      Sign in with Google
    </Button>
  );
}
