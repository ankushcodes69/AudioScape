import { useEffect } from "react";
import { Linking } from "react-native";
import { useRouter } from "expo-router";

const useNotificationClickHandler = () => {
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const { url } = event;
      if (url === "trackplayer://notification.click") {
        await router.push("..");
        if (await router.canDismiss()) await router.dismissTo("/player");
        else await router.navigate("/player");
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, [router]);
};

export default useNotificationClickHandler;
