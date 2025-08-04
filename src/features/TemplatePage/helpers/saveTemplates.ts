import { TemplateFile } from "../model/TemplateFile";
import { getBaseURL } from "./getBaseUrl";

const post = async (url: string, body: unknown) => {
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response;
};

export const saveTemplates = (templates: TemplateFile[]) => {
  const fullURL = `${getBaseURL()}/api/templates/create`;
  console.log("Saving templates to:", fullURL);
  return post(fullURL, { templates });
};
