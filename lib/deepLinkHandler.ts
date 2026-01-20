import * as Linking from "expo-linking";

export const initPaymentDeepLink = (callback: (data: any) => void) => {
  Linking.addEventListener("url", ({ url }) => {
    const { queryParams } = Linking.parse(url);
    callback(queryParams);
  });
};
