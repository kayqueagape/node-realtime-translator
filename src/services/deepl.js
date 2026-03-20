import deepl   from "deepl-node";
import readline from "readline";
import "dotenv/config";

const LINGUAS = {
  "1":  { codigo: "PT-BR", nome: "Português (Brasil)"   },
  "2":  { codigo: "PT-PT", nome: "Português (Portugal)" },
  "3":  { codigo: "EN-US", nome: "Inglês (EUA)"         },
  "4":  { codigo: "EN-GB", nome: "Inglês (Reino Unido)" },
  "5":  { codigo: "ES",    nome: "Espanhol"             },
  "6":  { codigo: "FR",    nome: "Francês"              },
  "7":  { codigo: "DE",    nome: "Alemão"               },
  "8":  { codigo: "IT",    nome: "Italiano"             },
  "9":  { codigo: "JA",    nome: "Japonês"              },
  "10": { codigo: "ZH",    nome: "Chinês"               },
  "11": { codigo: "RU",    nome: "Russo"                },
  "12": { codigo: "KO",    nome: "Coreano"              },
};

const deeplClient = new deepl.DeepLClient(process.env.DEEPL_API);

export async function selectLanguage() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("╔══════════════════════════════════╗");
  console.log("║    Select the target language    ║");
  console.log("╚══════════════════════════════════╝\n");

  for (const [num, lingua] of Object.entries(LINGUAS)) {
    console.log(`  [${num.padStart(2)}] ${lingua.nome}`);
  }

  return new Promise((resolve) => {
    rl.question("\n Enter the language code: ", (resposta) => {
      rl.close();
      const choose = LINGUAS[resposta.trim()];
      if (!choose) {
        console.log(" Invalid option. Using Brazilian Portuguese as the default.\n");
        resolve(LINGUAS["1"]);
      } else {
        console.log(`\n Translating to:: ${choose.nome} (${choose.codigo})\n`);
        resolve(choose);
      }
    });
  });
}

export async function translate(text, targetLang) {
  try {
    const resultado = await deeplClient.translateText(text, null, targetLang);
    return resultado.text;
  } catch (err) {
    console.error("DeepL error:", err.message);
    return text;
  }
}