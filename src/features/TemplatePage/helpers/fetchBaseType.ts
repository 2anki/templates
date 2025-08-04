import { getBaseURL } from "./getBaseUrl";

export default async function fetchBaseType(name: string) {
  const url = `${getBaseURL()}/templates/${name}.json`;
  console.log(`Fetching template ${name} from:`, url);

  try {
    const request = await window.fetch(url);

    if (!request.ok) {
      throw new Error(`HTTP error! status: ${request.status}`);
    }

    return await request.json();
  } catch (error) {
    console.error(`Failed to fetch template ${name} from ${url}:`, error);
    throw error;
  }
}
