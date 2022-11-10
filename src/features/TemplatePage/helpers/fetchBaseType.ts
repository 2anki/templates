export default async function fetchBaseType(name: string) {
  const url = `/templates/${name}.json`;
  const request = await window.fetch(url);
  return request.json();
}
