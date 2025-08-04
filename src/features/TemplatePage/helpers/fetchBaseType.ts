import { getBaseURL } from "./getBaseUrl";

export default async function fetchBaseType(name: string) {
  try {
    // Try to fetch from remote first
    const url = `${getBaseURL()}/templates/${name}.json`;
    const request = await window.fetch(url);

    if (!request.ok) {
      throw new Error(`HTTP error! status: ${request.status}`);
    }

    return await request.json();
  } catch (error) {
    console.warn(
      `Failed to fetch from remote, trying local server for ${name}:`,
      error
    );

    // Fallback to local server through proxy
    try {
      const localUrl = `/templates/${name}.json`;
      const localRequest = await window.fetch(localUrl);

      if (!localRequest.ok) {
        throw new Error(
          `Local server fetch failed! status: ${localRequest.status}`
        );
      }

      return await localRequest.json();
    } catch (localError) {
      console.error(
        `Both remote and local server fetch failed for ${name}:`,
        localError
      );
      throw localError;
    }
  }
}
