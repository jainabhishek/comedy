export interface OpenAIResponseLike {
  output_text?: string | null;
  output?: Array<{
    type: string;
    text?: string;
  }>;
}

export function extractResponseText(response: OpenAIResponseLike): string {
  const directText = response.output_text?.trim();
  if (directText && directText.length > 0) {
    return directText;
  }

  const textChunks = response.output
    ?.map((item) => (item.type === "output_text" && item.text ? item.text : ""))
    .filter((text) => text.length > 0);

  if (textChunks && textChunks.length > 0) {
    return textChunks.join("\n").trim();
  }

  return "";
}
