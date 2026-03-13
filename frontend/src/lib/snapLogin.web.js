/**
 * Web stub for react-native-snap-kit-login (native-only).
 * On web, Snap login is unavailable; use phone/OTP or Dev bypass.
 */
const stub = {
  login: async () => {
    throw new Error("Snapchat login is only available in the mobile app.");
  },
};
export default stub;
export const login = stub.login;
