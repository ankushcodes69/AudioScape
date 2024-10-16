import { Link, Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={styles.container}>
        <Text style={styles.titletext}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linktext}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  titletext: {
    fontSize: 25,
    fontWeight: "bold",
    lineHeight: 32,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linktext: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});
