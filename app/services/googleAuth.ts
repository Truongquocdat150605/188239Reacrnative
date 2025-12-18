import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = () => {
    const [request, response, promptAsync] =
        Google.useIdTokenAuthRequest({
            clientId: "1031967144798-2hsg53a2fe2m8iie7nn675c3tstiof1s.apps.googleusercontent.com",
        });

    const loginWithGoogle = async () => {
        const result = await promptAsync();

        if (result.type === "success") {
            const { id_token } = result.params;

            // 🔐 Login Firebase
            const credential = GoogleAuthProvider.credential(id_token);
            const userCredential = await signInWithCredential(auth, credential);

            const user = userCredential.user;

            // ✅ 🔥 BƯỚC 5: TẠO USER TRONG FIRESTORE
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                await setDoc(userRef, {
                    name: user.displayName || "",
                    email: user.email || "",
                    role: "user",
                    createdAt: new Date(),
                });
            }
        }
    };

    return { loginWithGoogle };
};
