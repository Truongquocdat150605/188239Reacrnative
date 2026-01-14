import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useEffect } from "react";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = () => {
  const [request, response, promptAsync] =
    Google.useIdTokenAuthRequest({
      clientId: "xxx.apps.googleusercontent.com",
      androidClientId: "xxx.apps.googleusercontent.com",
      iosClientId: "xxx.apps.googleusercontent.com",
      webClientId: "xxx.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    });


  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  return { loginWithGoogle: () => promptAsync() };
};
