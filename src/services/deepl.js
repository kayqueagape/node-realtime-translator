
import * as deepl from "deepl-node";
import "dotenv/config";

const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API);

export async function translate(text, targetLang) {
  try {
    const result = await deeplClient.translateText(text, null, targetLang);
    return result.text;
  } catch (err) {
    console.error("DeepL error:", err.message);
    return text;
  }
}
