import { Redirect } from "expo-router";

export default function Index() {
  const isAuthenticated = false;

  return isAuthenticated ? (
    <Redirect href="/" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
