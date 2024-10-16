import { useEffect } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";

const useNotificationClickHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url === "trackplayer://notification.click") {
        router.push("..");
        router.navigate("/player");
        NavigationBar.setVisibilityAsync("hidden");
        NavigationBar.setBehaviorAsync("overlay-swipe");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);
};

export default useNotificationClickHandler;
