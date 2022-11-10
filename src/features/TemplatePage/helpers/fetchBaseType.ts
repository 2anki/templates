import { getBaseURL } from "./getBaseUrl"

export default async function fetchBaseType(name: string) {
  const url = `${getBaseURL()}/templates/${name}.json`;
  const request = await window.fetch(url);
  return request.json();
}
