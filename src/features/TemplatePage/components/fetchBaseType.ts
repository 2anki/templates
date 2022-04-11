export default async function fetchBaseType(name: string) {
  const url = `https://2anki.net/templates/${name}.json`;
  const request = await window.fetch(url);
  return request.json();
}
