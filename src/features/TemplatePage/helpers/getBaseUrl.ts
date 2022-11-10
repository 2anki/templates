export const getBaseURL = (isDebug?: boolean) => {
        if (isDebug) {
                return "";
        }
        return "https://2anki.net";
}