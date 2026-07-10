import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize GoogleGenAI SDK with fallback safety
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.error("Error setting up Gemini Client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running with local fallback knowledge engine.");
}

// Built-in expert fallback response generator for the hot niche (based on actual user data & roadmap)
function getFallbackResponse(type: string, prompt: string, context: any) {
  const name = context?.name || "Modelo";
  const history = context?.history || "Estudante extrovertida que quer ganhar independência financeira";
  const bodyType = context?.body || "Corpo mignon e cabelos escuros";
  const life = context?.soul || "Tímida em público mas provocadora no secreto";
  const rostro = context?.rostro || "Rosto oval, olhar inocente, covinhas marcantes";
  const currentValue = context?.currentValue || "";
  
  if (type === "persona-field-completion") {
    const field = context?.field || "rostro";
    
    // Clean current value from generic placeholder text if present
    const cleanCurrent = (currentValue && !currentValue.startsWith("Descreva") && !currentValue.startsWith("Qual o arquétipo")) ? currentValue.trim() : "";

    if (field === "rostro") {
      const base = cleanCurrent || rostro;
      return {
        text: `${base}. Valoriza-se a expressividade natural em selfies do cotidiano, mantendo o cabelo liso solto ou em rabo de cavalo espontâneo, perfeitos para transmitir autenticidade absoluta em fotos de estilo caseiro.`
      };
    }
    if (field === "alma") {
      const base = cleanCurrent || life;
      return {
        text: `${base}. O tom de voz transmite timidez e proximidade no público, criando uma atmosfera irresistível de intimidade exclusiva e segredos compartilhados através de áudios diários sussurrados.`
      };
    }
    if (field === "corpo") {
      const base = cleanCurrent || bodyType;
      return {
        text: `${base}. Evita-se poses artificiais de estúdio profissional, dando preferência para roupas cotidianas confortáveis como camisetas largas e moletons, reforçando a estética de fofocas e privacidade cotidiana vazada.`
      };
    }
    if (field === "historia") {
      const base = cleanCurrent || history;
      return {
        text: `${base}. Esta narrativa emotiva gera alta empatia no público masculino nacional, motivando-os a apoiar financeiramente a modelo sob o sentimento heróico e protetor de estarem ajudando uma jovem batalhadora real.`
      };
    }
    return { text: "Definição refinada com sucesso para o HotFunnel." };
  }

  if (type === "generate-image-prompts") {
    return {
      text: `### 📸 Prompts Gerados para Criação de Imagem (Copiar para SeaArt/TensorArt/WeFaceSwap)

Aqui estão os prompts ultra detalhados estruturados especificamente com as características de **${name}** para garantir a melhor consistência e naturalidade visual:

---

#### 1. 👩 Rosto Consistente (Avatar de alta definição para Perfil do Instagram/TikTok)
* **Finalidade**: Foto de perfil marcante, limpa e natural.
* **Prompt (Copiar em Inglês)**:
\`\`\`text
High resolution portrait photo of 21 years old brazilian girl, ${rostro || "delicate oval face, charming dark eyes"}, hyperdetailed skin texture, soft professional portrait lighting, shot on 85mm lens, f/1.8, bokeh background, photorealistic, natural look, high quality, 8k --ar 1:1
\`\`\`
* **Prompt Negativo**:
\`\`\`text
3d render, cartoon, digital illustration, anime, airbrushed skin, bad anatomy, deformed eyes, extra fingers, plastic look, makeup cake, oversaturated
\`\`\`

---

#### 2. 👗 Sessão de Fotos Casual (Corpo Inteiro - Para postar no feed do Instagram)
* **Finalidade**: Mostrar o biotipo físico de forma amadora e natural.
* **Prompt (Copiar em Inglês)**:
\`\`\`text
Full body photograph of 21y/o girl, ${bodyType || "slender fitness natural body"}, wearing tight modern casual wear jeans and white simple top, standing in a cozy warm living room, cinematic lighting, shot on DSLR, realistic lighting, realistic shadow, 35mm lens, candid expression, extremely detailed, --ar 3:4
\`\`\`

---

#### 3. 🤳 Stories do Dia-a-Dia (Visual Amador "Vazado" em frente ao espelho)
* **Finalidade**: Criar extrema conexão e realismo (sentimento de intimidade de WhatsApp).
* **Prompt (Copiar em Inglês)**:
\`\`\`text
Extremely casual selfie shot in a bedroom mirror, amateur phone camera quality, girl with her hair in a messy bun, wearing grey oversized hoodie, smiling softly, grainy texture, natural warm room lighting, reflections, photorealistic, raw upload style, --ar 9:16
\`\`\`

---

#### 4. 🚀 Criativo de Anúncio Meta Ads (O segredo do tráfego barato)
* **Finalidade**: Segurar o clique nas redes de forma limpa sem infringir políticas (alta taxa de CTR).
* **Prompt (Copiar em Inglês)**:
\`\`\`text
POV candid shot across a table, beautiful girl sitting in a local cafe, drinking coffee, looking directly at the camera with a subtle shy smile, holding a smartphone, wearing casual simple clothes, beautiful natural sunlight flare, cinematic rendering, photorealistic, 8k --ar 3:4
\`\`\`

*Dica de Execução: Cole esses prompts no seu gerador preferido (SeaArt, TensorArt ou RenderNet) e use a mesma ferramenta de FaceSwap (como WeFaceSwap) se precisar transferir o rosto da modelo principal para novas poses para manter 100% de persistência.*`
    };
  }

  if (type === "persona-suggestion") {
    return {
      text: `### 🎯 Recomendações de Aperfeiçoamento para a Persona: **${name}**

Sua persona atual foca em: *"${history.substring(0, 80)}..."*

Aqui está o refinamento estratégico gerado com base na metodologia de Alta Conversão Hot:
1. **Atributo Proibido (Alma x Faca)**: Destaque o contraste entre a vida pública e a intimidade secreta. Se ela é estudante ou séria em público (front aceitável), na intimidade privada ela é extremamente expressiva, provocadora e focada no cliente. Isso atiça o desejo inconsciente da conquista.
2. **Backstory Emocional**: Reforce nas conversações iniciais e no grupo de prévias do Telegram o motivo de ela estar vendendo conteúdos (ex: pagar a faculdade, realizar uma viagem, fetiche secreto inocente). Clientes adoram apoiar financeiramente garotas que aparentam precisar ou que estão se divertindo com isso.
3. **Plataformas de Geração**: Utilize **SeaArt**, **Tensor Art** ou **WeFaceSwap** para consistência de rosto. Dica de ouro: Gere 15 variações de poses no mesmo cenário (ex: quarto clássico de estudante) e use em Reels e no Telegram para criar uma ambientação real.
4. **Chamada de Ação (CTA)**: Use imagens com ganchos baseados no cotidiano dela (ex: 'Estava estudando e lembrei de você... quer ver o que eu faço nos intervalos? Link na bio').`
    };
  }

  if (type === "content-ideas") {
    return {
      text: `### 📅 Ideias Exclusivas de Conteúdo Geradas para: **${name}**

Com base no nicho hot e na jornada da modelo, aqui estão sugestões práticas de Reels, Stories e Prévias imediatas:

1. **Reels/TikTok (Captação Viral - Com Gancho Forte)**:
   * **Visual**: Ela em frente ao espelho com roupa casual (ex: moletom ou pijama comportado) com carinha de tímida.
   * **Texto na tela**: "Por fora: a estudante quietinha da sala... Por dentro: [censurado para não perder a bolsa]".
   * **Legenda**: "Quem vê cara não vê coração. Quer descobrir meu outro lado? O link tá no meu perfil... 🤐❤️"
   * **CTA**: Direcionar para o Instagram/Telegram.

2. **Stories IG (Aquecimento e Intimidade)**:
   * **Story 1 (Manhã)**: Foto tomando café ou estudando com legenda descontraída: "Bom dia, o dia tá corrido hoje... mas já já tenho uma surpresa."
   * **Story 2 (Tarde - Caixa de perguntas)**: "Manda sua pergunta, respondo as mais ousadas lá no canal secreto... Link nos destaques".
   * **Story 3 (Noite - Gatilho ManyChat)**: Vídeo curto (close no olhar ou sorriso) com texto: "Acabei de liberar um mimo exclusivo gratuito para quem comentar 'QUERO' agora. Corre!"

3. **Telegram Canal Grátis/Prévias (Conversão Final)**:
   * **Postagem**: Foto de lingerie ou biquíni com zoom ou sutilmente censurada.
   * **Texto**: "Gente, acabei de postar o vídeo completo sem cortes lá no VIP. É aquele fetiche que vocês tanto me pediram de roupa de colegial... Link de acesso nos stories ou na bio!"`
    };
  }

  if (type === "funnel-step-advice") {
    return {
      text: `### ⚙️ Guia Estratégico Passo a Passo do Copiloto Hot
 
Para o perfil **${name}**, otimize o funil seguindo estes mandamentos:
1. **ManyChat Integrado**: O gatilho principal de captação no Instagram deve disparar uma automação no ManyChat que qualifica o lead rapidamente. Exemplo: Enviar foto de prévia grátis mediante cadastro ou entrada imediata no Canal do Telegram Grátis.
2. **Gargalo de Conversão**: A conversão fria dói. Não divulgue o link da plataforma principal (Privacy/OnlyFans ou checkout) diretamente no perfil do IG. Conduza o público para o Canal do Telegram Grátis. Lá eles são "esquentados" com áudios espontâneos, enquetes e mimos antes de receberem a oferta irresistível.
3. **Esteira de Ticket Baixo**: Seu front deve ser agressivo (R$ 9,90 ou R$ 14,90 para o VIP Mensal). O lucro de verdade vem do **Orderbump** (ex: "+ Acesso ao close friends por R$ 5") e dos **Upsells** oferecidos na página de Obrigado e no robô após a compra (ex: "Combo Fetiches + Chat Privado por R$ 29,90").`
    };
  }

  if (type === "custom-generator") {
    return {
      text: `ROTEIRO INTERATIVO GERADO PARA ${name.toUpperCase()}

Aqui está a peça de alta conversão estruturada sob medida para a sua modelo virtual com base na sua instrução:

• ORIENTAÇÃO DO USUÁRIO PROCESSADA:
"${prompt || "Produzir roteiro espontâneo de engajamento"}"

• CONSONÂNCIA DE PERSONA APLICADA:
Este material foi calibrado para herdar a história de ${name} (sua história de fundo: ${history}), em harmonia com a personalidade/arquétipo (${life}), o rosto (${rostro}) e a estética amadora do seu corpo (${bodyType}).

• ELEMENTO OPERACIONAL SUGERIDO:
Olá, meninos... De verdade, se vocês soubessem como está sendo a correria de concorrer a exames, estudos e a rotina diária com a criação de conteúdo aqui... Mas como eu sei que vocês amam me ver e incentivar a minha jornada, acabei de liberar uma prévia super sutil com a minha roupa casual que vocês costumam pedir. O link está na bio no meu Telegram privado de mimos. Quem entrar me apoia diretamente a pagar as contas da faculdade e ganha um presentinho único.

• ATIVAÇÃO DE FUNIL (SUTILEZA E CONEXÃO):
Use o ManyChat para disparar esse roteiro como se fosse um áudio improvisado de WhatsApp gravado no momento em que ela acorda ou chega em casa, mantendo a sensação realista do backstory e gerando uma alta taxa de conversão.`
    };
  }

  if (type === "generate-product-suite") {
    const isEnf = history.toLowerCase().includes("enf") || history.toLowerCase().includes("format") || history.toLowerCase().includes("facul") || history.toLowerCase().includes("estud");
    const isAcademy = bodyType.toLowerCase().includes("gym") || bodyType.toLowerCase().includes("fitness") || bodyType.toLowerCase().includes("academia");
    
    let frontName = `VIP Diário - Acesso Premium`;
    let frontDesc = `Acesso ao meu canal VIP privativo por 24 horas para ver meus vídeos reais sem censura do dia-a-dia.`;
    let frontPrice = 9.90;
    
    let bumpName = `Meu WhatsApp Pessoal (Sem Censura)`;
    let bumpDesc = `Ativação do meu WhatsApp para conversar direto comigo, ver meus stories exclusivos e áudios íntimos diários.`;
    let bumpPrice = 19.90;
    
    let upsellName = `Pack Proibido - Coleção Completa`;
    let upsellDesc = `Mais de 120 fotos e 45 vídeos inéditos e amadores que eu nunca vou postar em outra rede.`;
    let upsellPrice = 39.90;

    let downsellName = `Pack Pocket - Mini Coleção de Boas-Vindas`;
    let downsellDesc = `Seletiva com 15 fotos amadoras e 5 vídeos exclusivos para quem quer experimentar primeiro.`;
    let downsellPrice = 14.90;

    if (isEnf) {
      frontName = `Plantão VIP - Histórias Secretas`;
      frontDesc = `Acesso ao meu canal VIP de bastidores do pós-plantão por 24 horas com vídeos e desabafos amadores.`;
      bumpName = `Fetiche de Colegial + Contato Privado`;
      bumpDesc = `Adicione o fetiche de colegial que todos me pedem mais o meu WhatsApp privado para darmos plantão juntos.`;
      upsellName = `Estúdio de Gravação VIP - Álbum Secreto`;
      upsellDesc = `Acesso completo a todas as minhas mídias pessoais amadoras gravadas em dias de folga da faculdade.`;
    } else if (isAcademy) {
      frontName = `Cofre da FitGirl - VIP Exclusivo`;
      frontDesc = `Vídeos amadores reais no vestiário e bastidores dos meus treinos diários sem censura.`;
      bumpName = `WhatsApp Pessoal da Personal + Áudios`;
      bumpDesc = `Converse comigo, veja meus stories secretos do dia-a-dia e receba áudios íntimos sussurrados.`;
      upsellName = `Coleção VIP - Treino Sem Roupa`;
      upsellDesc = `Minha seleção mais quente e ousada de vídeos e fotos amadoras inéditas feitas dentro de quatro paredes.`;
    } else {
      frontName = `Segredos da ${name} - VIP Vitalício`;
      frontDesc = `Entre hoje no meu grupo privado de prévias e vídeos exclusivos do dia-a-dia sem censura.`;
      bumpName = `Adicionar WhatsApp de Confissões`;
      bumpDesc = `Fale diretamente no meu número pessoal, ouça meus áudios sussurrados e confissões exclusivas de fim de noite.`;
      upsellName = `Mega Pack da ${name} - Coleção Proibida`;
      upsellDesc = `Acesso à minha galeria na nuvem com dezenas de pastas com fetiches de salto, meias e lingerie fina.`;
    }

    const fallbackProducts = [
      { id: `prod-ia-front-${Date.now()}`, type: "Front", name: frontName, price: frontPrice, description: frontDesc, isActive: true },
      { id: `prod-ia-bump-${Date.now()}`, type: "Orderbump", name: bumpName, price: bumpPrice, description: bumpDesc, isActive: true },
      { id: `prod-ia-upsell-${Date.now()}`, type: "Upsell", name: upsellName, price: upsellPrice, description: upsellDesc, isActive: true },
      { id: `prod-ia-downsell-${Date.now()}`, type: "Downsell", name: downsellName, price: downsellPrice, description: downsellDesc, isActive: true }
    ];

    return {
      text: JSON.stringify(fallbackProducts)
    };
  }

  if (type === "analyze-reddit-favorites") {
    return {
      text: `ANALISE TÁTICA DE CONTEÚDO DOS FAVORITOS DE ${name.toUpperCase()}

Aqui estão temas e ganchos visuais baseados nas suas referências salvas:

TEMA E CONCEITOS DOS ENSAIOS
Aproveitando o tom amador e fofinho das suas referências, crie sessões com iluminação natural em cenários cotidianos. Por exemplo, faça fotos em estilo "desatenta" mexendo no celular no sofá ou fingindo ler um livro. Isso gera uma credibilidade impressionante de garota comum real.

GANCHOS VISUAIS PARA STORIES
Story de manhã: Tirar uma selfie de pijama com cara de sono segurando uma caneca de café, descontraída.
Story no espelho do banheiro: Uma foto espontânea fingindo escovar os dentes, usando um moletom oversized confortável e meias. Passa extrema intimidade de casal.

COPYWRITING E ENGAJAMENTO
Use ganchos de direct ou legendas: "Fiz um ensaio amador de moletom hoje que ficou super fofinho... querem ver a foto proibida do espelho lá no VIP? Comenta QUERO que te mando!"`
    };
  }

  if (type === "suggest-subreddits") {
    const defaultSuggestions = [
      {
        url: "https://nsfwdog.com/sub/Amateur",
        label: "Looks de Casa - r/Amateur",
        notes: "Observe as poses de espelho super naturais e as roupas normais do dia-a-dia. Perfeito para se inspirar em fotos casuais de stories cotidianos."
      },
      {
        url: "https://nsfwdog.com/sub/selfie",
        label: "Selfies Naturais - r/selfie",
        notes: "Excelente para se inspirar em expressões faciais espontâneas, rostos limpos sem maquiagem pesada e sorrisos amigáveis que geram identificação."
      },
      {
        url: "https://nsfwdog.com/sub/homely",
        label: "Atmosfera de Casa - r/homely",
        notes: "Ideias de cenários de quartos comuns, roupas caseiras e poses descontraídas deitada ou se arrumando."
      },
      {
        url: "https://nsfwdog.com/sub/softies",
        label: "Visual Fofo e Tímido - r/softies",
        notes: "Inspirador para garotas com arquétipo doce ou tímido. Foco em blusas confortáveis e iluminação aconchegante."
      },
      {
        url: "https://nsfwdog.com/sub/WorkOut",
        label: "Looks Fitness - r/WorkOut",
        notes: "Estilo saudável e ativo. Poses com looks esportivos, academia, pós-treino ou bebendo água."
      }
    ];

    return {
      text: JSON.stringify(defaultSuggestions)
    };
  }

  return {
    text: `### 💡 Dicas de Escala e Anúncios para **${name}**

* **Estrutura de Teste Meta Ads**: Use a estrutura **1-3-1** (1 Campanha ABO, 3 Conjuntos de Anúncios testando interesses amplos/público aberto, e 1 Criativo de alta curiosidade por conjunto).
* **Criativos Recomendados**: Fotos estilo 'selfie amadora' convertem 3x mais do que imagens profissionais em estúdio. Use ganchos como "Meu namorado tirou essa de mim... ficou boa?"
* **Contingência**: Crie uma conta de anúncios e faça o aquecimento com campanhas de engajamento antes de subir conversão. Use um link intermediário próprio (Linktree customizado) e nunca envie tráfego direto para plataformas baníveis.`
  };
}

// Helper to clean placeholders so custom text written by the user is preserved and amplified rather than wiped out.
function cleanPlaceholderAndGetCustomText(val: string): string {
  if (!val) return "";
  const trimmed = val.trim();
  
  const placeholders = [
    "Descreva a consistência física do rosto (para geração por IA). Ex: Morena, cabelos ondulados, olhos pretos marcantes.",
    "Qual o arquétipo psicológico, hobbies de front e fetiches que ativam a intimidade?",
    "Características do físico da modelo virtuais (corpo amador, manequim, traços, etc.).",
    "Backstory da modelo (estudante de faculdade pública que precisa pagar o curso, etc.).",
    "Descreva a consistência física do rosto (para geração por IA). Ex: Morena, cabelos ondulados, olhos pretos marcantes"
  ];
  
  if (placeholders.some(p => trimmed === p)) {
    return "";
  }
  
  let result = trimmed;
  for (const p of placeholders) {
    if (result.startsWith(p)) {
      result = result.substring(p.length).trim();
    }
  }
  
  return result;
}

// Universal response cleaner to wipe out any annoying markdown asterisks, hashtags, or excessive punctuation clutter.
function cleanOutputTextUniversal(text: string, isPersonaField: boolean = false): string {
  if (!text) return "";
  
  if (isPersonaField) {
    // Single paragraphs returned without any markup, hashes, headers or bullets
    return text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/###/g, "")
      .replace(/##/g, "")
      .replace(/#/g, "")
      .replace(/---\s*/g, "")
      .replace(/["'“”]/g, "")
      .replace(/^-/g, "")
      .replace(/•/g, "")
      .replace(/```[a-zA-Z]*\n?/gi, "")
      .replace(/\\/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
  
  let clean = text;
  // 1. Remove markdown bold and italic markers
  clean = clean.replace(/\*\*/g, "");
  clean = clean.replace(/\*/g, "");
  
  // 2. Remove code blocks
  clean = clean.replace(/```[a-zA-Z]*\n?/gi, "");
  
  // 3. Clean headers at line starts
  clean = clean.replace(/^#+\s+/gm, "");
  
  // 4. Clean extra horizontal lines
  clean = clean.replace(/^-{3,}\s*/gm, "");
  
  // 5. Clean wrapping quotes
  clean = clean.replace(/["'“”]/g, "");

  // 6. Harmonize bullets
  clean = clean.replace(/^- /gm, "• ");
  clean = clean.replace(/^\*\s+/gm, "• ");
  
  return clean.trim();
}

// API Route for Gemini content generation
app.post("/api/generate", async (req, res) => {
  const { type, prompt: userPrompt, context } = req.body;

  // Custom API key sent in header or request body
  const customKey = req.headers["x-gemini-api-key"] || req.body?.customApiKey;
  const openRouterKey = req.headers["x-openrouter-api-key"] || req.body?.customOpenRouterApiKey;

  console.log(`[API Generate] Type: ${type}`);
  console.log(`[API Generate] Gemini Key received: ${customKey ? "YES (length: " + (typeof customKey === 'string' ? customKey.length : 'non-string') + ")" : "NO"}`);
  console.log(`[API Generate] OpenRouter Key received: ${openRouterKey ? "YES" : "NO"}`);

  let requestAi = ai;
  if (customKey && typeof customKey === "string" && customKey.trim() !== "" && customKey.trim() !== "MY_GEMINI_API_KEY") {
    try {
      console.log("[API Generate] Initializing GoogleGenAI client with custom key...");
      requestAi = new GoogleGenAI({
        apiKey: customKey.trim(),
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build-custom',
          }
        }
      });
    } catch (err) {
      console.error("[API Generate] Error setting up custom request-level Gemini Client:", err);
    }
  }

  if (!type) {
    return res.status(400).json({ error: "O parâmetro 'type' é obrigatório." });
  }

  const name = context?.name || "Modelo";
  const bodyType = context?.corpo || context?.body || "Corpo exuberante";
  const life = context?.alma || context?.soul || "Romântica porém ousada";
  const history = context?.historia || context?.history || "Estudante extrovertida que quer crescer no digital";
  const rostro = context?.rostro || context?.face || "Rosto natural e inocente";
  const currentValue = context?.currentValue || "";

  // Build the specialized hot niche prompt for Gemini with strict, anti-clutter directives
  let systemInstruction = `Você é o HotFunnel Manager GPT, um especialista sênior em funis de vendas para o nicho de conteúdo adulto/hot, Meta Ads, automações ManyChat/Telegram, e criação de modelos virtuais inteligentes. Você domina técnicas de conversão, psicologia masculina nacional, ganchos de tráfego, e esteiras de micro-transações (R$ 9,90).
Suas respostas devem ser dadas em Português do Brasil (PT-BR), com tom altamente pragmático, objetivo, focado em alta conversão de vendas, direto e amigável.

IMPORTANTE SOBRE FORMATAÇÃO E LEITURA FACILITADA:
O usuário ODEIA textos poluídos com caracteres especiais redundantes ou excessivos.
1. Não utilize quaisquer sintaxes Markdown poluídas como negrito com asteriscos duplos (**texto**), marcas de itálico (*texto*), traços longos (---), barras de divisão repetitivas (/ /) ou hashes (#) nos títulos.
2. Em especial, nunca coloque o texto do retorno principal dentro de aspas.
3. Se precisar estruturar tópicos ou rotinas, utilize números normais ("1.", "2.") ou pontos de tópicos simples como "•" na linha.
4. Para cabeçalhos, use linhas limpas em LETRAS MAIÚSCULAS simples (ex: ROTEIRO SUGERIDO no lugar de ### Roteiro).
5. O texto deve fluir com parágrafos elegantes e espaçamento em branco natural de linha dupla para que a leitura direta na tela seja impecável e limpa.

O usuário está gerenciando a modelo chamada: ${name}, cujo rosto é: ${rostro}, corpo é: ${bodyType}, alma: ${life}, e história de fundo (backstory): ${history}.`;

  let prompt = "";
  if (type === "persona-field-completion") {
    const field = context?.field || "rostro";
    const cleanCurrent = cleanPlaceholderAndGetCustomText(currentValue);

    prompt = `Como redator criativo especialista em narrativas de alta retenção no mercado hot, preciso que expanda o seguinte campo de persona da nossa modelo virtual ${name}.

O campo a expandir é: "${field}" (pode ser rostro, alma, corpo ou historia).
O texto original que o usuário já escreveu e que você DEVE PRESERVAR é: "${cleanCurrent}".

DIRETRIZES DE OURO (MANDATÓRIAS):
1. PRESERVAÇÃO INTEGRAL: Você é terminantemente proibido de alterar, ignorar ou apagar as ideias, palavras e frases que o usuário já escreveu ("${cleanCurrent}"). O seu texto de retorno deve obrigatoriamente iniciar de forma suave continuando a partir do que o usuário já escreveu, enriquecendo-o com complementos perfeitos de alta conversão.
2. CONTEÚDO TÁTICO DE EXPANSÃO:
   - Para "rostro" (rosto): Incremente com detalhes altamente específicos e naturais de expressões faciais, pele, olhar, luzes, ideais para consistência de rosto por IA.
   - Para "alma" (personalidade): Adicione o tom de voz sedutor, hobbies cotidianos de fachada aceitavelmente tímidos, fetiches secretos casuais de alta rentabilidade (pé sutil, meia calça, colegial, etc.).
   - Para "corpo" (corpo): Adicione traços físicos realistas de modelo amadora (ex: mignon, cintura fina, quadril macio, fotos não profissionais, trajes casuais como blusas folgadas).
   - Para "historia" (backstory): Torne a história de vida emocionante, crível e que humanize e crie um gatilho heróico de caridade (exclusividade de sustento financeiro estudantil ou sustento de pets).
3. FORMATAÇÃO TOTALMENTE LIMPA: Não use absolutamente NENHUM asterisco, travessão, barra ou caractere especial de markdown. Retorne apenas o parágrafo de texto corrido expandido em português correto e fluido de 2 a 4 frases, pronto para ser gravado diretamente no campo da modelo. Sem introduções vazias.`;
  } else if (type === "generate-image-prompts") {
    const rostro = context?.rostro || "";
    prompt = `Como engenheiro de prompts sênior, crie um conjunto completo de prompts de imagem ultra realistas de alta conversão para a modelo virtual ${name} para alimentar as redes e o funil.
Utilize as seguintes descrições físicas para fidelidade:
Rosto: ${rostro}
Corpo: ${bodyType}
Personalidade/Vibe: ${life}

Gere exatamente 4 tipos de prompts profissionais detalhados em inglês (com pesos e configurações de câmera) acompanhados de breves títulos descritivos em português explicativos:
1. Portrait de Rosto (Avatar) - Foto em close para mídias sociais
2. Sessão Casual de Corpo Inteiro - Mostrando a silhueta em locais domésticos/urbanos normais
3. Selfie Amadora de Stories (No espelho) - Totalmente estilo caseiro de celular
4. Criativo de Tráfego Pago (Alta Curiosidade e Cliques Baratos) - Foto intrigante sem infringir as políticas de anúncios.`;
  } else if (type === "persona-suggestion") {
    prompt = `Gere sugestões para aprimorar a persona de ${name}. Analise as informações fornecidas: Alma (${life}), Corpo (${bodyType}), História (${history}). Adicione ideias de fetiches casuais compatíveis, o "contraste proibido" (ex: garota tímida estudante mas super fogosa no secreto) e estratégias para humanizar o perfil e torná-lo irresistível. Sem usar asteriscos ou travessões markdown, organize em LETRAS MAIÚSCULAS simples e parágrafos limpos. ${userPrompt ? `Anotações do usuário: ${userPrompt}` : ""}`;
  } else if (type === "content-ideas") {
    prompt = `Gere ideias altamente virais, diferenciadas, curtas e de altíssima conversão de conteúdo especificamente personalizadas para ${name}. 
O usuário DETESTA clichês batidos e ideias genéricas demais (do tipo "olá pessoal, arrasta pra cima"). Queremos roteiros e hooks extremamente espontâneos, curtos, de conexão real amadora, e focados no Manychat ou Telegram com o tom exato da modelo.

Forneça de forma limpa e em prosa bem legível:
1. DUAS PROPOSTAS DE REELS/TIKTOK COMPLETAMENTE FORA DA CAIXA: Descreva ganchos visuais cotidianos da modelo (ex: se estudando Enfermagem ou se arrumando rápida no quarto) e ganchos dinâmicos para colocar na tela e legenda curta.
2. TRÊS STORIES DO INSTAGRAM NATIVOS E CURTOS: Roteiros espontâneos para criar antecipação e vender mídias ou o seu WhatsApp VIP privativo. Use storytelling realista, simulando conversas diretas de balcão ou desabafos cotidianos.
3. DUAS ESTRATÉGIAS DE DISPARO DE TELEGRAM GRÁTIS DE ALTA RELEVÂNCIA: Unindo áudios e imagens provocativas sutis.

Não utilize negrito por asteriscos ou cabeçalhos markdown. Use linhas de títulos limpas em maiúsculas simples.
Use ao máximo as características dela: Alma (${life}), Corpo (${bodyType}), História (${history}). ${userPrompt ? `Anotação adicional do usuário: ${userPrompt}` : ""}`;
  } else if (type === "funnel-step-advice") {
    prompt = `Como consultor hot sênior, dê recomendações estratégicas detalhadas para a etapa descrita pelo usuário: "${userPrompt || "Estrutura Geral de Lançamento e Vendas"}". Explique como converter melhor nessa etapa específica e como contornar os principais erros cometidos por iniciantes no nicho. Escreva sem marcas de estilo markdown do tipo negrito ou hashes, organizando por parágrafos e frases bem construídas.`;
  } else if (type === "funnel-task-guidance") {
    const taskName = context?.taskName || "Executar Operação";
    const stepId = context?.stepId || 1;
    const stepTitle = context?.stepTitle || "";
    
    prompt = `Como consultor e estrategista sênior do HotFunnel, seu objetivo é guiar detalhadamente um iniciante sobre como realizar a seguinte tarefa operacional de forma prática:
    
    📋 DETERMINAÇÃO DA TAREFA: "${taskName}"
    📍 PERTENCENTE AO PASSO: ${stepId} (${stepTitle})
    
    Leve em consideração a identidade e persona da nossa modelo virtual ${name}:
    - ROSTO: ${rostro}
    - CORPO: ${bodyType}
    - ALMA (Personalidade): ${life}
    - HISTÓRIA (Backstory de fundo): ${history}
    
    Forneça um guia passo a passo extraordinariamente prático, didático e adaptado para iniciantes sobre como realizar essa tarefa específica no cotidiano.
    Seja minucioso e divida em seções limpas usando LETRAS MAIÚSCULAS simples (ex: O QUE FAZER, SCRIPT PRÁTICO PERSONALIZADO, PASSO A PASSO TÁTICO, ERROS COMUNS):
    
    O QUE FAZER
    Explique o objetivo central da tarefa.
    
    SCRIPT PRÁTICO E GANCHO PERSONALIZADOS (MANDATÓRIO)
    Dê exemplos de roteiros de reels, copies de direct, copies de stories ou scripts de Manychat customizados especificamente para ${name}, fazendo uso direto de seu backstory e carisma.
    
    COMO OPERAR PASSO A PASSO
    Indique onde clicar, quais aplicativos/ferramentas usar, ou como configurar de maneira extremamente didática para um completo iniciante.
    
    ERROS COMUNS A EVITAR
    Alerte sobre as armadilhas mais comuns de quem está começando.
    
    Use formatação inteiramente limpa, sem caracteres especiais markdown (como asteriscos duplos **, hashtags # ou divisórias). Organize em parágrafos bem espaçados.`;
  } else if (type === "generate-product-suite") {
    const cleanRostro = cleanPlaceholderAndGetCustomText(rostro);
    const cleanBody = cleanPlaceholderAndGetCustomText(bodyType);
    const cleanLife = cleanPlaceholderAndGetCustomText(life);
    const cleanHistory = cleanPlaceholderAndGetCustomText(history);

    prompt = `Como estrategista sênior de monetização hot-funnel, seu objetivo é criar uma esteira de produtos de alta conversão (Micro-transactions & Upsell Ladder) totalmente personalizada para a modelo virtual ${name}.
    
    Analise profundamente os traços de fetiches, história de fundo, alma e rosto da modelo para criar produtos com apelo irresistível e crível:
    - ROSTO: ${cleanRostro || "Natural e tímido"}
    - CORPO / BIOTIPO: ${cleanBody || "Mignon e curvilíneo"}
    - PERSONALIDADE / ALMA: ${cleanLife || "Tímida mas sussurradora"}
    - HISTÓRIA / BACKSTORY: ${cleanHistory || "Estudante batalhadora que busca independência"}

    Crie exatamente 4 produtos estratégicos e atraentes que façam total sentido lógico com o backstory de ${name} (por exemplo, se ela estuda de manhã e precisa pagar a faculdade de Enfermagem, use ganchos de uniformes ou estudos de madrugada; se ela é atleta de academia, treinos suados e calcinhas de academia):
    
    1. PRODUTO "Front" (Preço sugerido: R$ 4,90 a R$ 14,90): Um infoproduto barato de acesso por impulso com fotos/vídeos amadores cotidianos de fachada leve (ex: VIP do Instagram ou close friends baratinho, "Acesso Diário").
    2. PRODUTO "Orderbump" (Preço sugerido: R$ 9,90 a R$ 24,90): Vendido no mesmo checkout em um clique. Deve complementar o Front imediatamente (ex: "Meu WhatsApp Privado", "Áudios íntimos do dia-a-dia").
    3. PRODUTO "Upsell" (Preço sugerido: R$ 29,90 a R$ 69,90): Uma oferta irresistível logo pós-pagamento com mais profundidade (ex: "Álbum completo proibido", "Coleção de Fetiches Secretos").
    4. PRODUTO "Downsell" (Preço sugerido: R$ 9,90 a R$ 19,90): Oferecido caso ele recuse o Upsell, com valor menor (ex: "Mini Pack de Boas-Vindas", "Prévia Seletiva Quente").

    A saída deve ser estritamente formatada como um JSON array contendo os 4 objetos de produtos com as chaves:
    - id: string amigável (ex: "prod-ia-front", "prod-ia-bump", "prod-ia-upsell", "prod-ia-downsell")
    - type: string exata ("Front", "Orderbump", "Upsell" ou "Downsell")
    - name: título extraordinariamente envolvente, contextualizado e sedutor (em PT-BR)
    - price: valor numérico em reais (reais brasileiros, ex: 14.90)
    - description: descrição convincente em português que explica exatamente o segredo do material e apela à curiosidade masculina amadora.
    - isActive: booleano true.`;
  } else if (type === "custom-generator") {
    const cleanRostro = cleanPlaceholderAndGetCustomText(rostro);
    const cleanBody = cleanPlaceholderAndGetCustomText(bodyType);
    const cleanLife = cleanPlaceholderAndGetCustomText(life);
    const cleanHistory = cleanPlaceholderAndGetCustomText(history);

    prompt = `Como redator criativo especialista sênior e estrategista de funil hot da modelo virtual ${name}, preciso que você execute a seguinte tarefa tática solicitada pelo usuário:
    
⚠️ TAREFA SOLICITADA DO USUÁRIO (EXECUTE COM PRIORIDADE ABSOLUTA, CONCISÃO EXTREMA E SEM CLICHÊS):
"${userPrompt}"

Sua tarefa de redação deve ser PROFUNDAMENTE personalizada de acordo com o pedido do usuário e fazer total sentido para a identidade da modelo. É mandatório que você herde, integre e reflua perfeitamente as informações estruturadas da modelo abaixo:

💄 PERFIL E PERSONA DE ${name}:
- ROSTO DA MODELO: ${cleanRostro || "Estilo amador e expressões naturais"}
- CORPO / BIOTIPO: ${cleanBody || "Biotipo natural e atraente"}
- PERSONALIDADE/ALMA / ARQUÉTIPO (como ela conversa e se expressa): ${cleanLife || "Tímida, carismática e autêntica"}
- HISTÓRIA DE FUNDO / BACKSTORY EMOCIONAL (Por que ela cria conteúdo, de onde ela veio, rotina cotidiana de front): ${cleanHistory || "Estudante que precisa pagar a faculdade e despesas"}

INSTRUÇÕES DE ESCRITA MANDATÓRIAS:
1. NUNCA gere materiais aleatórios ou genéricos. O tom de fala, piadas, rotinas, menções a canais (ManyChat, Instagram, Telegram) e fetiches sugeridos DEVEM rimar perfeitamente com a história de fundo e personalidade dela. Se ela é estudante de Enfermagem que precisa pagar o aluguel, os scripts devem sutilemente tocar nisso ou em elementos cotidianos de estudos/estágio!
2. Use o Português falado amador do Brasil (PT-BR) com gírias leves, erros de fala casuais simulando digitação rápida de WhatsApp/Stories, e formatação limpa.
3. Mantenha os ganchos de persuasão refinados e o tom perfeito de amadora inocente mas desejável no privado. Evite ao máximo introduções padrão ("Olá gente", "Tudo bem com vocês?"), vá direto ao ponto, com estilo dinâmico, conciso e diferenciado da concorrência que é profissional demais e parece robótica.
4. Formate o resultado utilizando tópicos claros com LETRAS MAIÚSCULAS simples para divisões das seções. Sem aspas iniciais/finais redundantes, sem asteriscos ou hashtags de markdown.`;
  } else if (type === "analyze-reddit-favorites") {
    const savedPages = context?.savedPages || [];
    const pagesDescription = savedPages.map((p: any) => `- ${p.label}: ${p.url}${p.notes ? ` (Anotações: ${p.notes})` : ""}`).join("\n");

    prompt = `Como estrategista sênior de funis de modelos virtuais inteligentes, analise as referências de subreddits salvas nos favoritos da modelo ${name}:
    
    📋 PÁGINAS DO REDDIT SALVAS:
    ${pagesDescription || "Nenhuma página salva ainda nos favoritos."}
    
    💄 PERFIL DA MODELO:
    - ROSTO: ${rostro}
    - CORPO: ${bodyType}
    - ALMA (Personalidade): ${life}
    - HISTÓRIA: ${history}
    
    A partir dessas referências do Reddit salvas (as quais estão sendo acessadas via nsfwdog.com) e da persona de ${name}, desenvolva um relatório com ganchos inovadores divididos em seções com títulos limpos em LETRAS MAIÚSCULAS simples:
    
    TEMA E CONCEITOS DOS ENSAIOS
    Ideias de fotos e ensaios criativos que unem os nichos indicados pelas páginas salvas com a fofura/timidez/sensualidade natural da modelo.
    
    GANCHOS VISUAIS PARA STORIES
    Propostas de poses no espelho, vídeos curtos se arrumando, roupas normais e desleixadas de casa, ou closes rápidos que transmitem a sensação amadora real.
    
    COPYWRITING E ENGAJAMENTO
    Ideias de textos e ganchos em posts ou direct para capturar a atenção de membros dessas comunidades do Reddit e convertê-los no funil ManyChat/Telegram.
    
    Use formatação limpa de parágrafos bem espaçados, sem asteriscos double, markdown headers (#) ou aspas externas.`;
  } else if (type === "suggest-subreddits") {
    prompt = `Como curador de tráfego orgânico e estrategista criativo hot, preciso que você analise minuciosamente o perfil de nossa modelo virtual ${name}:
    - ROSTO: ${rostro}
    - CORPO: ${bodyType}
    - ALMA: ${life}
    - HISTÓRIA: ${history}
    
    Com base nesses traços e backstory, sugira exatamente 5 subreddits reais no Reddit (que o usuário acessará através de nsfwdog.com) altamente compatíveis com ela.
    Exemplos: se ela tem perfil tímido/colegial, r/selfie, r/Amateur, r/homely, r/softies; se ela é atlética, r/WorkOut, r/yoga, r/fitgirls.
    
    Para cada sugestão, retorne:
    1. url: URL completa iniciando obrigatoriamente com "https://nsfwdog.com/sub/" seguido do nome real do subreddit (ex: "https://nsfwdog.com/sub/Amateur").
    2. label: Nome cativante em português do canal + utilidade (ex: "Looks de Casa - r/Amateur").
    3. notes: Uma breve anotação de 1 frase em português explicando o que a modelo deve se inspirar e observar nesse fórum.
    
    O retorno deve ser estritamente um JSON array válido contendo objetos com as chaves "url", "label" e "notes".`;
  } else {
    prompt = userPrompt || `Gere dicas gerais de marketing, tráfego Meta Ads (ABO vs CBO) e esteira de produtos para a modelo ${name}.`;
  }

  // If OpenRouter key is provided, route through OpenRouter
  const openRouterModel = req.headers["x-openrouter-model"] || req.body?.customOpenRouterModel || "google/gemini-2.5-flash";

  if (openRouterKey && typeof openRouterKey === "string" && openRouterKey.trim() !== "") {
    try {
      console.log(`Using OpenRouter with model ${openRouterModel}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "HotFunnel Manager"
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: prompt }
          ],
          temperature: 0.9,
          response_format: (type === "generate-product-suite" || type === "suggest-subreddits") ? { type: "json_object" } : undefined
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      let text = data?.choices?.[0]?.message?.content || "";

      if (type === "persona-field-completion") {
        text = cleanOutputTextUniversal(text, true);
        const cleanCurrent = cleanPlaceholderAndGetCustomText(currentValue);
        if (cleanCurrent && !text.startsWith(cleanCurrent.substring(0, 15))) {
          text = `${cleanCurrent} ${text}`;
        }
      } else if (type === "generate-product-suite" || type === "suggest-subreddits") {
        // Keep raw JSON intact
      } else {
        text = cleanOutputTextUniversal(text, false);
      }
      return res.json({ text, isAiGenerated: true });
    } catch (openRouterError: any) {
      console.warn("OpenRouter API error, falling back to local simulation.", openRouterError?.message || openRouterError);
      const fallback = getFallbackResponse(type, userPrompt, context);
      if (type === "generate-product-suite" || type === "suggest-subreddits") {
        return res.json({ text: fallback.text, isAiGenerated: false });
      }
      const cleanedFallback = cleanOutputTextUniversal(fallback.text, type === "persona-field-completion");
      return res.json({ 
        text: `(Nota: Inteligência Local Ativa - Erro OpenRouter: ${openRouterError?.message || 'Erro desconhecido'})\n\n${cleanedFallback}`, 
        isAiGenerated: false 
      });
    }
  }

  // Use Gemini API if available, otherwise use Fallback Engine
  if (requestAi) {
    try {
      let runConfig: any = {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        topP: 0.95,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ]
      };

      if (type === "generate-product-suite") {
        runConfig.responseMimeType = "application/json";
        runConfig.responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, description: "Must be exactly one of: 'Front', 'Orderbump', 'Upsell', 'Downsell'" },
              name: { type: Type.STRING },
              price: { type: Type.NUMBER },
              description: { type: Type.STRING },
              isActive: { type: Type.BOOLEAN }
            },
            required: ["id", "type", "name", "price", "description", "isActive"]
          }
        };
      } else if (type === "suggest-subreddits") {
        runConfig.responseMimeType = "application/json";
        runConfig.responseSchema = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              url: { type: Type.STRING, description: "Must start with https://nsfwdog.com/sub/" },
              label: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["url", "label", "notes"]
          }
        };
      }

      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          console.log(`[API Generate] Attempting content generation with model: ${modelName}`);
          response = await requestAi.models.generateContent({
            model: modelName,
            contents: prompt,
            config: runConfig
          });
          console.log(`[API Generate] Success with model: ${modelName}`);
          break;
        } catch (err: any) {
          lastError = err;
          console.warn(`[API Generate] Failed with model ${modelName}:`, err.message || err);
          // If it is a key invalid error, fail early since trying other models won't help
          if (err.message && (err.message.includes("API key not valid") || err.message.includes("API_KEY_INVALID"))) {
            throw err;
          }
        }
      }

      if (!response) {
        throw lastError || new Error("Failed to generate content with any model.");
      }
      
      let text = response.text || "";
      if (type === "persona-field-completion") {
        text = cleanOutputTextUniversal(text, true);
        const cleanCurrent = cleanPlaceholderAndGetCustomText(currentValue);
        if (cleanCurrent && !text.startsWith(cleanCurrent.substring(0, 15))) {
          text = `${cleanCurrent} ${text}`;
        }
      } else if (type === "generate-product-suite" || type === "suggest-subreddits") {
        // Keep raw JSON intact
      } else {
        text = cleanOutputTextUniversal(text, false);
      }
      return res.json({ text, isAiGenerated: true });
    } catch (apiError: any) {
      console.error("[API Generate] Gemini API error:", apiError);
      const fallback = getFallbackResponse(type, userPrompt, context);
      if (type === "generate-product-suite" || type === "suggest-subreddits") {
        return res.json({ text: fallback.text, isAiGenerated: false });
      }
      const cleanedFallback = cleanOutputTextUniversal(fallback.text, type === "persona-field-completion");
      return res.json({ 
        text: `(Nota: Inteligência Local Ativa - Erro: ${apiError?.message || JSON.stringify(apiError)})\n\n${cleanedFallback}`, 
        isAiGenerated: false 
      });
    }
  } else {
    // Return Local expert fallback
    const fallback = getFallbackResponse(type, userPrompt, context);
    if (type === "generate-product-suite") {
      return res.json({ text: fallback.text, isAiGenerated: false });
    }
    const cleanedFallback = cleanOutputTextUniversal(fallback.text, type === "persona-field-completion");
    return res.json({ 
      text: `(Nota: Inteligência Local Ativa)\n\n${cleanedFallback}`, 
      isAiGenerated: false 
    });
  }
});

// Configure Vite middleware or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Middlewares do Vite montados.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Servindo arquivos de dist em modo produção.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HotFunnel Manager backend rodando na porta ${PORT}`);
  });
}

startServer();
