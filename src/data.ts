import { ModelProfile, Product } from "./types";

// Base templates for wizard checklist items
export const STEP_CHECKLISTS: { [key: number]: string[] } = {
  1: [
    "Definição completa da Persona: Rosto (Consistência), Alma (Tom de voz e humor), Corpo (Traços marcantes), e História (Por que ela vende).",
    "Estudo do Desejo Oculto e Fetiches-chave dos clientes potenciais da persona.",
    "Geração de Assets Visuais consistentes usando IA (Tensor Art, SeaArt, RenderNet ou WeFaceSwap).",
    "Geração de 15 a 20 mídias de estilo casual/caseiro para alimentar o feed e prévias iniciais.",
    "Gravação de áudios preliminares de 'boas-vindas' com tom espontâneo e sussurrado."
  ],
  2: [
    "Criação e higienização do perfil no Instagram (Bio intrigante + estética amadora/cotidiana).",
    "Estruturação dos 3 Destaques Principais: 'Sobre Mim' (humanização), 'VIP/Segredo' (provas e antecipação), 'Mimos Grátis' (atração de lead).",
    "Publicação de 6 fotos espontâneas no feed para quebrar o visual vazio.",
    "Criação de perfis satélites para captação secundária (TikTok, Kwai, Twitter/X, Threads).",
    "Interação leve com seguidores masculinos ativos de perfis concorrentes (extração de leads)."
  ],
  3: [
    "Criação de BM de Contingência (Business Manager) + Aquecimento de Conta de Anúncios.",
    "Criação do Pixel Meta e compartilhamento com as Contas de Anúncios de Contingência.",
    "Configuração das automações no ManyChat (Respostas automáticas para o direct 'QUERO').",
    "Criação e customização do Canal Grátis e Canal VIP no Telegram.",
    "Configuração e teste do Bot de Cobrança e Vendas integrado no canal principal do Telegram."
  ],
  4: [
    "Definição e cadastro do Front-End irresistível (VIP Diário/Mensal a preço absurdamente baixo: R$ 9,90).",
    "Desenho do Orderbump na tela de checkout (ex: + Grupo Close Friends por R$ 5,00).",
    "Criação de 3 Ofertas de Upsell Sequenciais (ex: Vídeo Fetiche R$ 19, - WhatsApp Privado R$ 39, - Vídeo Chamada de 10 min R$ 79).",
    "Estruturação do Downsell imediato para checkout abandonado (Ex: desconto no VIP por R$ 4,90 ou Kit de Fotos Compacto por R$ 7,90).",
    "Check se o Pixel de Vendas e Checkout iniciados estão instalados e disparando corretamente em todas as telas."
  ],
  5: [
    "Criação do calendário de postagens diárias (Manhã: Bom dia íntimo / Tarde: Pergunta picante / Noite: CTA ManyChat).",
    "Roteirização de Reels focado em curiosidade extrema com gancho que obriga o usuário a interagir.",
    "Criação de super-stories com storytelling realista (ex: 'Estava lavando a louça e acabei me sujando inteira... miau').",
    "Programação de postagens automáticas e cíclicas no Canal de Telegram Prévias."
  ],
  6: [
    "Preparação de criativos Meta Ads no formato 'Selfie amadora' e 'Vídeo curto tremido em frente ao espelho' (foge de cara de anúncio).",
    "Configuração de campanha de Venda ABO com estrutura 1-3-1 (1 campanha, 3 conjuntos de públicos de interesse abertos, 1 criativo vencedor por conjunto).",
    "Otimização inicial após 48h retirando conjuntos com CTR menor que 5,5% ou CPM abusivo.",
    "Acompanhamento da taxa de CTR e custo por lead inicial no topo do funil."
  ],
  7: [
    "Otimização do custo por venda no checkout e redução do abandono de carrinho.",
    "Duplicação e escala vertical (aumento de 20-30% do orçamento) das campanhas com ROI maior que 2.5.",
    "Criação de campanhas de tráfego de Lançamento Relâmpago dentro do Telegram VIP com as 'novas amigas'.",
    "Implementação do Pixel em páginas de ofertas pós-venda (Obrigado) de forma fluida."
  ],
  8: [
    "Análise de faturamento líquido x custo de tráfego (Meta Ads + ferramentas).",
    "Substituição de mídias que saturaram ou pararam de receber engajamento.",
    "Auditoria e rodízio de links de contingência preventiva para evitar bloqueios de perfil de captação.",
    "Ajuste fino nas mensagens do ManyChat conforme os principais desvios observados no atendimento."
  ]
};

export const INITIAL_PRODUCTS_TEMPLATES: Product[] = [
  { id: "1", type: "Front", name: "Acesso Canal VIP Mensal", price: 9.90, description: "Acesso ao canal fechado com postagens diárias, áudios exclusivos e interações espontâneas da modelo.", isActive: true },
  { id: "2", type: "Orderbump", name: "Acesso Add Close Friends (IG)", price: 4.90, description: "Ver o dia a dia e os stories mais quentes banhados de mistério.", isActive: true },
  { id: "3", type: "Upsell", name: "Vídeo Fetiche Secreto (Colegial / Banho)", price: 19.90, description: "Um vídeo caseiro de 8 minutos focado em fantasias sugeridas.", isActive: true },
  { id: "4", type: "Upsell", name: "WhatsApp Particular da Modelo (Chat real)", price: 49.90, description: "Converse diretamente com o perfil da modelo, mande áudios e interaja intimamente.", isActive: true },
  { id: "5", type: "Downsell", name: "Amostra Pocket (10 fotos exclusivas)", price: 5.90, description: "Para quem não quer assinar o VIP cheio, uma amostra expressa.", isActive: true }
];

export const INITIAL_PROFILES: ModelProfile[] = [
  {
    id: "perfil-larissa",
    name: "Larissa Mendes",
    startDate: "2026-05-10",
    status: "Ativo",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fit=crop&w=400&h=400&q=80",
    persona: {
      rostro: "Estilo timidez fofa, rostinho angelical de óculos, cabelos castanhos lisos, pele natural, olhar sutil de quem guarda segredos.",
      alma: "Estudante de Nutrição na USP, extremamente focada nos estudos de dia, reservada e quietinha. À noite, no VIP secreto, liberta seu lado despudorado, brincalhão e extremamente provocativo. Fala sussurrado por áudio e se demonstra curiosa.",
      corpo: "Visual natural, magrinha com curvas sutis (formato de pera), sarda suave nos ombros, sem tatuagens para manter a estética clássica de moça de família.",
      historia: "Criou o canal para conseguir pagar a faculdade de nutrição e morar sozinha em São Paulo. Ela divide o quarto de forma simples e o contraste de estar estudando de dia e gravando vídeos de noite na escrivaninha atiça a fantasia de cumplicidade do cliente de ajudá-la na 'vida real'."
    },
    funnelSteps: [
      {
        stepId: 1,
        title: "Persona + Criação da Modelo (assets IA)",
        description: "Estruturar o conceito, rosto persistente e back-story e gerar as imagens e mídias base.",
        status: "Concluído",
        completedTasks: [
          "Definição completa da Persona: Rosto (Consistência), Alma (Tom de voz e humor), Corpo (Traços marcantes), e História (Por que ela vende).",
          "Estudo do Desejo Oculto e Fetiches-chave dos clientes potenciais da persona.",
          "Geração de Assets Visuais consistentes usando IA (Tensor Art, SeaArt, RenderNet ou WeFaceSwap).",
          "Geração de 15 a 20 mídias de estilo casual/caseiro para alimentar o feed e prévias iniciais."
        ],
        evidence: "Rosto da Larissa modelado com TensorArt e consistência validada em 25 fotos cotidianas em bibliotecas, cozinha e quarto.",
        improvements: "Melhorar a iluminação artificial nas fotos de estudo para parecer mais amador sob luz natural.",
        aiAdvice: "Excelente posicionamento de contrastes! A persona 'sonsa de óculos' tem o maior CTR de fundo de funil no mercado brasileiro."
      },
      {
        stepId: 2,
        title: "Estruturação das Redes Sociais de Captação",
        description: "Montar perfil otimizado com bio engajante, destaques e posts de humanização cotidiana.",
        status: "Concluído",
        completedTasks: [
          "Criação e higienização do perfil no Instagram (Bio intrigante + estética amadora/cotidiana).",
          "Estruturação dos 3 Destaques Principais: 'Sobre Mim' (humanização), 'VIP/Segredo' (provas e antecipação), 'Mimos Grátis' (atração de lead).",
          "Publicação de 6 fotos espontâneas no feed para quebrar o visual vazio."
        ],
        evidence: "@nutrilari_secret criado, feed higienizado, stories salvos em destaques fakes com provas de mimos que convertem absurdos.",
        improvements: "Inserir mais posts mostrando conquistas simples dela, tipo fazer compras no mercado.",
        aiAdvice: "Evite fotos muito sensuais de cara no feed principal do IG para não sofrer shadowban prévio. Deixe o 'quente' para os Stories e para o Telegram!"
      },
      {
        stepId: 3,
        title: "Setup Técnico (Pixel, ManyChat, Telegram)",
        description: "Ligar pixel, criar contingência de link, montar automações ManyChat e os canais do robô.",
        status: "Em andamento",
        completedTasks: [
          "Criação de BM de Contingência (Business Manager) + Aquecimento de Conta de Anúncios.",
          "Criação e customização do Canal Grátis e Canal VIP no Telegram."
        ],
        evidence: "Canal aberto no Telegram com 1.200 membros grátis. Bot funcionando sutilmente.",
        improvements: "Pixel de Ads ainda precisa ser criado nas contas de contingência e embutir na Hubla de checkout.",
        aiAdvice: "Recomendo vincular o gatilho 'QUERO' do ManyChat para enviar de forma imediata o link do Telegram Grátis por áudio simulado."
      },
      {
        stepId: 4,
        title: "Esteira de Produtos e Ofertas",
        description: "Configurar front agressivo, orderbump e upsells/downsells sequenciais.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: "Para a Lari, recomendo o Front-end de R$ 9,90/mês + Orderbump de R$ 4,90 (Segredo do Pijama) + Upsell 1 de R$ 19,90 (Vídeo proibido na biblioteca)."
      },
      {
        stepId: 5,
        title: "Calendário e Produção de Conteúdo",
        description: "Planejar cronograma diário, ganchos provocativos e publicações automatizadas.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: "Abuse do storytelling de 'estudar até tarde': 'Não aguento mais esse livro de anatomia... mas posso te mostrar o que aprendi hoje lá no VIP.'"
      },
      {
        stepId: 6,
        title: "Lançamento e Teste de Campanhas Ads",
        description: "Colocar campanha ABO de vendas para rodar testando públicos e criativos casuais.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: "Use criativos com look 'estudando com óculos' e legenda instigadora: 'Cometi um erro na biblioteca hj... conto tudo no link'."
      },
      {
        stepId: 7,
        title: "Otimização, Scaling e Retenção",
        description: "Crescer orçamento de anúncios validados e criar picos de faturamento interno no Telegram.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      },
      {
        stepId: 8,
        title: "Análise e Ajustes",
        description: "Revisar as margens financeiras, reavaliar contingências de links.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      }
    ],
    calendar: [
      { id: "cal-l-1", platform: "Instagram", type: "Stories", hook: "Estudando anatomia de óculos", desc: "Caixa de pergunta aberta: 'Mande um segredinho que eu respondo se ja fiz... os piores respondo lá no canal secreto'", published: true, date: "2026-06-16" },
      { id: "cal-l-2", platform: "Instagram", type: "Reels", hook: "Por fora a santinha da USP, por dentro...", desc: "Vídeo vestida de moletom segurando uma maçã, transição sutil para ela de pijama com olhar provocante descontraído. CTA para Direct.", published: false, date: "2026-06-17" },
      { id: "cal-l-3", platform: "Telegram", type: "Prévia Grátis", hook: "Áudio sussurrado de boa noite", desc: "Ela diz que acabou de deitar e está sozinha no quarto, convida a irem para o privado antes que a colega de quarto chegue.", published: false, date: "2026-06-17" }
    ],
    campaigns: [
      { id: "camp-l-1", name: "[ABO] Larissa - Teste Públicos Abertos", type: "ABO", budget: 35.00, structure: "1-3-1", leadCtr: 7.2, saleCtr: 1.8, roi: 2.1, note: "Criativo 'Selfie no Espelho' performando com menor custo por clique. Escalar essa estrutura.", status: "Ativo" }
    ],
    products: [
      { id: "prod-l-1", type: "Front", name: "Larissa Secreta - Canal VIP Mensal", price: 9.90, description: "Acesso ao canal fechado da Larissa com mídias do quarto.", isActive: true },
      { id: "prod-l-2", type: "Orderbump", name: "+ Adicionar no Close Friends (IG)", price: 4.90, description: "O dia a dia real sem censuras no Instagram.", isActive: true },
      { id: "prod-l-3", type: "Upsell", name: "Vídeo Proibido na Biblioteca (Caso Extremo)", price: 19.90, description: "Gravação amadora de fetiche na biblioteca vazia.", isActive: true }
    ],
    notes: "Larissa está tracionando super bem no tráfego aberto de SP. O nicho de caras que amam universitárias inteligentes é de altíssima conversão.",
    logs: [
      { id: "log-l-1", timestamp: "2026-06-15 14:22", text: "Persona criada com rostro focado em contrastes tímida/provocante." },
      { id: "log-l-2", timestamp: "2026-06-16 09:10", text: "Subido criativo de teste no Facebook Ads com criativo selfie amadora." }
    ]
  },
  {
    id: "perfil-vini",
    name: "Vini E-Girl (Vini)",
    startDate: "2026-05-25",
    status: "Em scaling",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?fit=crop&w=400&h=400&q=80",
    persona: {
      rostro: "Cabelos pretos com mechas coloridas azuis ou roxas, pele bem clara, delineado gatinho pronunciado, bochechas levemente rosadas, estilo alternativo e-girl.",
      alma: "Estilo tímido e introvertido com gostos de fã de jogos eletrônicos e mangás. No VIP, se transforma em uma manipuladora sutil, dominadora fofa, apaixonada por fetiches de jogos (cosplay) e caixas de som imitando sons sensuais.",
      corpo: "Estilo mignon/petite, magrinha, com meias altas listradas, piercings sutis e roupas de anime de alta qualidade.",
      historia: "Ela joga RPG de mesa e faz transmissões ao vivo de games que não rendem o suficiente para se sustentar. Abriu o Canal Privado VIP 'Vini Cosplay' para arrecadar fundos para comprar um novo setup de PC Gamer e fazer cosplays caros sob encomenda para fãs fiéis."
    },
    funnelSteps: [
      {
        stepId: 1,
        title: "Persona + Criação da Modelo (assets IA)",
        description: "Estruturar o conceito, rosto persistente e back-story e gerar as imagens e mídias base.",
        status: "Validado",
        completedTasks: [
          "Definição completa da Persona: Rosto (Consistência), Alma (Tom de voz e humor), Corpo (Traços marcantes), e História (Por que ela vende).",
          "Estudo do Desejo Oculto e Fetiches-chave dos clientes potenciais da persona.",
          "Geração de Assets Visuais consistentes usando IA (Tensor Art, SeaArt, RenderNet ou WeFaceSwap).",
          "Geração de 15 a 20 mídias de estilo casual/caseiro para alimentar o feed e prévias iniciais."
        ],
        evidence: "Validado com mais de 30 poses diferentes segurando controle de videogame, fone de orelha de gatinho no quarto led azul.",
        improvements: "Inserir cosplays clássicos (D.Va de Overwatch, etc.) altamente fieis usando loras de SeaArt.",
        aiAdvice: "Excelente! O nicho Gamer/Otaku é o que possui maior fidelidade e recorrência (LTV) no público até 30 anos."
      },
      {
        stepId: 2,
        title: "Estruturação das Redes Sociais de Captação",
        description: "Montar perfil otimizado com bio engajante, destaques e posts de humanização cotidiana.",
        status: "Concluído",
        completedTasks: [
          "Criação e higienização do perfil no Instagram (Bio intrigante + estética amadora/cotidiana).",
          "Estruturação dos 3 Destaques Principais: 'Sobre Mim' (humanização), 'VIP/Segredo' (provas e antecipação), 'Mimos Grátis' (atração de lead).",
          "Publicação de 6 fotos espontâneas no feed para quebrar o visual vazio."
        ],
        evidence: "Feed estruturado como se fosse streamer gamer real. Stories compartilhando setup gamer.",
        improvements: "Subir vídeos dela 'jogando' em frente a telas coloridas para dar mais dinamismo amador.",
        aiAdvice: "Crie um destaque chamado 'SETUP' mostrando as peças que ela quer comprar com as doações do VIP. Isso gera grande gatilho de suporte nos nerds carentes."
      },
      {
        stepId: 3,
        title: "Setup Técnico (Pixel, ManyChat, Telegram)",
        description: "Ligar pixel, criar contingência de link, montar automações ManyChat e os canais do robô.",
        status: "Concluído",
        completedTasks: [
          "Criação de BM de Contingência (Business Manager) + Aquecimento de Conta de Anúncios.",
          "Criação do Pixel Meta e compartilhamento com as Contas de Anúncios de Contingência.",
          "Configuração das automações no ManyChat (Respostas automáticas para o direct 'QUERO').",
          "Criação e customização do Canal Grátis e Canal VIP no Telegram.",
          "Configuração e teste do Bot de Cobrança e Vendas integrado no canal principal do Telegram."
        ],
        evidence: "Integração do ManyChat automática para mandar prévia gratuita da Vini 'tímida' de cosplay no Telegram. Conversão de tráfego orgânico bombando.",
        improvements: "Ajustar o delay do robô para simular digitação real antes de mandar áudio do Bot.",
        aiAdvice: "Lembre-se: O ManyChat deve parecer o mais pessoal possível; envie mídias rápidas e fáceis de carregar."
      },
      {
        stepId: 4,
        title: "Esteira de Produtos e Ofertas",
        description: "Configurar front agressivo, orderbump e upsells/downsells sequenciais.",
        status: "Concluído",
        completedTasks: [
          "Definição e cadastro do Front-End irresistível (VIP Diário/Mensal a preço absurdamente baixo: R$ 9,90).",
          "Desenho do Orderbump na tela de checkout (ex: + Grupo Close Friends por R$ 5,00).",
          "Criação de 3 Ofertas de Upsell Sequenciais (ex: Vídeo Fetiche R$ 19, - WhatsApp Privado R$ 39, - Vídeo Chamada de 10 min R$ 79)."
        ],
        evidence: "Front VIP Mensal R$ 14,90 cadastrado. Orderbump de 'Áudio personalizado fetiche gamer' por R$ 7,90 gerando 62% de taxa de conversão adicional.",
        improvements: "Preparar a esteira de High-Ticket de cosplay sob pedido por R$ 149.",
        aiAdvice: "Excelente resultado no Orderbump. Tente criar uma oferta de Upsell de 'Vídeo jogando vestida sutilmente' a R$ 24,90 imediatos."
      },
      {
        stepId: 5,
        title: "Calendário e Produção de Conteúdo",
        description: "Planejar cronograma diário, ganchos provocativos e publicações automatizadas.",
        status: "Em andamento",
        completedTasks: [
          "Criação do calendário de postagens diárias (Manhã: Bom dia íntimo / Tarde: Pergunta picante / Noite: CTA ManyChat).",
          "Roteirização de Reels focado em curiosidade extrema com gancho que obriga o usuário a interagir."
        ],
        evidence: "Cronograma de Reels em produção. Postamos 3 Reels que passaram de 15k views organicos com hashtag #egirl.",
        improvements: "Otimizar o CTA para mandar direct em vez do link de bio para evitar bloqueio do Instagram.",
        aiAdvice: "Sempre direcione para Direct ('comenta PC' ou 'comenta GAME') no Reels. É menos provável do Insta derrubar o alcance."
      },
      {
        stepId: 6,
        title: "Lançamento e Teste de Campanhas Ads",
        description: "Colocar campanha ABO de vendas para rodar testando públicos e criativos casuais.",
        status: "Em andamento",
        completedTasks: [
          "Preparação de criativos Meta Ads no formato 'Selfie amadora' e 'Vídeo curto tremido em frente ao espelho' (foge de cara de anúncio).",
          "Configuração de campanha de Venda ABO com estrutura 1-3-1 (1 campanha, 3 conjuntos de públicos de interesse abertos, 1 criativo vencedor por conjunto)."
        ],
        evidence: "Campanha ABO de R$ 50/dia ativa. Público de videogame/anime respondeu melhor ao criativo da Vini mofando.",
        improvements: "Pausar o conjunto com público genérico pois o CPA (Custo por Aquisição) subiu de R$ 8 pra R$ 18.",
        aiAdvice: "A Vini tem excelente apelo em público jovem nerd. Teste direcionamento para interesses em 'Twitch', 'Submarino' ou 'Marvel/Anime'."
      },
      {
        stepId: 7,
        title: "Otimização, Scaling e Retenção",
        description: "Crescer orçamento de anúncios validados e criar picos de faturamento interno no Telegram.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      },
      {
        stepId: 8,
        title: "Análise e Ajustes",
        description: "Revisar as margens financeiras, reavaliar contingências de links.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      }
    ],
    calendar: [
      { id: "cal-v-1", platform: "Instagram", type: "Reels", hook: "Seja meu player 2", desc: "Mostra ela de costas arrumando cabos no PC de meia longa azul, vira pra camera e diz que precisa de ajuda pra passar de fase no VIP. CTA Manychat.", published: true, date: "2026-06-15" },
      { id: "cal-v-2", platform: "TikTok", type: "Stories", hook: "Cosplay de Hermione secreto", desc: "Apenas ela segurando varinha mágica de óculos redondos e meia preta alta. 'Acabei de liberar o video magico completo lá secreto... link no perfil'", published: false, date: "2026-06-18" }
    ],
    campaigns: [
      { id: "camp-v-1", name: "[CBO] Vini - Escala PC Gamer", type: "CBO", budget: 120.00, structure: "1-1-3", leadCtr: 8.9, saleCtr: 3.1, roi: 3.8, note: "Público Otaku + Gamer engajado, criativo do fone gatinho. ROI sustentado excelente.", status: "Escalado" }
    ],
    products: [
      { id: "prod-v-1", type: "Front", name: "Vini Cosplays VIP - Canal Mensal", price: 14.90, description: "Acesso ao canal da E-girl com cosplays e áudios fetiches.", isActive: true },
      { id: "prod-v-2", type: "Orderbump", name: "+ Áudio sussurrado Gamer fetiche", price: 7.90, description: "Áudio simulando ela jogando no microfone sussurrando elogios.", isActive: true },
      { id: "prod-v-3", type: "Upsell", name: "Premium Cosplay D.Va (Vídeo 10 min)", price: 29.90, description: "Um ensaio amador completo animado no quarto gamer com luzes vermelhas.", isActive: true }
    ],
    notes: "Utilizando a contingência com link intermediário próprio, as quedas de contas zeraram. Continuar escalando CBO.",
    logs: [
      { id: "log-v-1", timestamp: "2026-06-14 10:00", text: "Integrado bot automatizado de vendas para entrega do link de afiliado cosplay." }
    ]
  },
  {
    id: "perfil-sheldon",
    name: "Sheldon (Dona de Casa)",
    startDate: "2026-06-01",
    status: "Precisa atenção",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=400&h=400&q=80",
    persona: {
      rostro: "Aparência de 28 a 30 anos, olhar maduro e expressivo, cabelos escuros ondulados na altura dos ombros, lábios marcantes, expressão calorosa e receptiva.",
      alma: "Estilo dona de casa ou diarista caprichosa (Sheldon). Fora dos holofotes, uma mulher cansada da rotina de faxina e boletos acumulados. Na intimidade secreta, ela assume o papel de exibicionista que adora mandar fotos secretas enquanto executa tarefas domésticas cotidianas.",
      corpo: "Corpo real, curvas acentuadas (estilo ampulheta brasileira), quadril largo, pernas grossas, visual extremamente natural e maduro sem retoques de estúdio.",
      historia: "Trabalhava limpando escritórios em prédios executivos, mas o dinheirinho não dava para cobrir as contas de casa. Suas fotos e vídeos começaram como uma brincadeira 'proibida' nos banheiros luxuosos que ela limpava, e agora ela atende a fetiches do mundo real de homens de negócios cansados que adoram a ideia de uma faxineira fogosa proibida."
    },
    funnelSteps: [
      {
        stepId: 1,
        title: "Persona + Criação da Modelo (assets IA)",
        description: "Estruturar o conceito, rosto persistente e back-story e gerar as imagens e mídias base.",
        status: "Concluído",
        completedTasks: [
          "Definição completa da Persona: Rosto (Consistência), Alma (Tom de voz e humor), Corpo (Traços marcantes), e História (Por que ela vende).",
          "Estudo do Desejo Oculto e Fetiches-chave dos clientes potenciais da persona.",
          "Geração de Assets Visuais consistentes usando IA (Tensor Art, SeaArt, RenderNet ou WeFaceSwap)."
        ],
        evidence: "Assets gerados de forma magnífica. Cenários de cozinhas, lavanderias e banheiros dão tom de alta credibilidade real à modelo.",
        improvements: "Consolidar mídias segurando cabo de vassoura ou espanador doméstico.",
        aiAdvice: "Excelente fetiche! O fetiche de 'faxineira proibida/tiazinha fogosa' é um dos mais lucrativos do Brasil em ticket médio."
      },
      {
        stepId: 2,
        title: "Estruturação das Redes Sociais de Captação",
        description: "Montar perfil otimizado com bio engajante, destaques e posts de humanização cotidiana.",
        status: "Em andamento",
        completedTasks: [
          "Criação e higienização do perfil no Instagram (Bio intrigante + estética amadora/cotidiana)."
        ],
        evidence: "Perfil criado, mas com apenas 2 fotos. Alcance orgânico ainda baixo.",
        improvements: "Inserir mais posts provocantes leves limpando a casa em reels para atrair público maduro de Facebook.",
        aiAdvice: "Dica crítica: Para esse nicho maduro doméstico, poste fotos e vídeos no Facebook Groups usando sua página profissional de captação! Funciona melhor que Reels para homens de 35+."
      },
      {
        stepId: 3,
        title: "Setup Técnico (Pixel, ManyChat, Telegram)",
        description: "Ligar pixel, criar contingência de link, montar automações ManyChat e os canais do robô.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: "Monte um robô ManyChat ultra humanizado. Deixe o áudio com barulho de água de fundo simulando que ela tá cozinhando ou limpando no momento da resposta."
      },
      {
        stepId: 4,
        title: "Esteira de Produtos e Ofertas",
        description: "Configurar front agressivo, orderbump e upsells/downsells sequenciais.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: "Esta esteira madura ama Combos! Crie um Front VIP Vitalício baratinho ou o 'Combo Faxina sem Censura' por R$ 19,90 direto!"
      },
      {
        stepId: 5,
        title: "Calendário e Produção de Conteúdo",
        description: "Planejar cronograma diário, ganchos provocativos e publicações automatizadas.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      },
      {
        stepId: 6,
        title: "Lançamento e Teste de Campanhas Ads",
        description: "Colocar campanha ABO de vendas para rodar testando públicos e criativos casuais.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      },
      {
        stepId: 7,
        title: "Otimização, Scaling e Retenção",
        description: "Crescer orçamento de anúncios validados e criar picos de faturamento interno no Telegram.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      },
      {
        stepId: 8,
        title: "Análise e Ajustes",
        description: "Revisar as margens financeiras, reavaliar contingências de links.",
        status: "Não iniciado",
        completedTasks: [],
        evidence: "",
        improvements: "",
        aiAdvice: ""
      }
    ],
    calendar: [
      { id: "cal-s-1", platform: "Facebook", type: "Feed", hook: "O dia de faxina demorou hoje...", desc: "Publicação no grupo de vizinhos ou classificados maduros: 'Mais alguém cansado da rotina doméstica? Queria um ajudante... poxa link grátis Telegram no meu perfil'", published: false, date: "2026-06-18" }
    ],
    campaigns: [],
    products: [
      { id: "prod-s-1", type: "Front", name: "Combo Faxineira Proibida - Acesso VIP", price: 19.90, description: "Acesso total aos vídeos secretos gravados em casa e banheiros corporativos.", isActive: true },
      { id: "prod-s-2", type: "Orderbump", name: "+ Vídeo limpando espelho sutil", price: 9.90, description: "Vídeo amador curto de 4 minutos no banheiro.", isActive: true }
    ],
    notes: "Perfil precisa de aquecimento de tráfego orgânico via Facebook. O público maduro não utiliza tanto o Instagram para essa conversão de microticket.",
    logs: [
      { id: "log-s-1", timestamp: "2026-06-16 11:45", text: "Estudo de fetiche doméstico validado. Geradas imagens consistentes deliciosas amadoras." }
    ]
  }
];

export const MAYA_FUJII_PROFILE: ModelProfile = {
  id: "perfil-maya-fujii",
  name: "Maya Fujii",
  startDate: "2026-06-10",
  status: "Ativo",
  avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?fit=crop&w=400&h=400&q=80",
  persona: {
    rostro: "Estética nipo-brasileira (half-Japanese, half-Brazilian). Cabelos pretos lisos com franja curta e reta, olhos marcantes e amendoados, traços delicados com uma expressão doce de anime e sorriso sutil de canto.",
    alma: "Estudante de Design de Moda de 22 anos na FAAP que mora na Liberdade em São Paulo. Tímida, artística e aficionada por cultura pop japonesa, mangás e cosplays na vida cotidiana. No VIP, revela uma personalidade lúdica, extremamente provocativa, que mistura a doçura e submissão oriental com a sensualidade e iniciativa brasileira. Fala sussurrado por áudio em tom manhoso e usa termos fofos para envolver os clientes.",
    corpo: "Estilo mignon (petite), magrinha com curvas delicadas, pele muito clara, clavícula bem marcada e uma pequena tatuagem de flor de cerejeira (cherry blossom) no ombro esquerdo que serve como marca de autenticidade (consistência visual).",
    historia: "Criação voltada para o fetiche da 'garota geek tímida oriental'. Ela vive sozinha em um apartamento estúdio pequeno decorado com pôsteres de anime e luzes LED. Criou o VIP para financiar seus materiais de costura para cosplays de alta qualidade e pagar o aluguel sem depender dos pais tradicionais. O storytelling foca no cliente ser o seu 'patrocinador' (senpai) secreto e ganhar em troca sua devoção e mídias exclusivas diárias."
  },
  funnelSteps: [
    {
      stepId: 1,
      title: "Persona + Criação da Modelo (assets IA)",
      description: "Estruturar o conceito, rosto persistente e back-story e gerar as imagens e mídias base.",
      status: "Validado",
      completedTasks: [
        "Definição completa da Persona: Rosto (Consistência), Alma (Tom de voz e humor), Corpo (Traços marcantes), e História (Por que ela vende).",
        "Estudo do Desejo Oculto e Fetiches-chave dos clientes potenciais da persona.",
        "Geração de Assets Visuais consistentes usando IA (Tensor Art, SeaArt, RenderNet ou WeFaceSwap).",
        "Geração de 15 a 20 mídias de estilo casual/caseiro para alimentar o feed e prévias iniciais."
      ],
      evidence: "Rosto da Maya modelado com SeaArt e consistência validada em mais de 35 fotos em estúdio de costura, quarto com luzes LED e cafés na Liberdade.",
      improvements: "Adicionar mídias dela vestindo casacos largos de moletom para acentuar a estética 'petite'.",
      aiAdvice: "Excelente! O apelo 'nipo-brasileiro geek' tem um dos maiores tickets médios em faturamento devido à escassez desse nicho qualificado no Brasil."
    },
    {
      stepId: 2,
      title: "Estruturação das Redes Sociais de Captação",
      description: "Montar perfil otimizado com bio engajante, destaques e posts de humanização cotidiana.",
      status: "Concluído",
      completedTasks: [
        "Criação e higienização do perfil no Instagram (Bio intrigante + estética amadora/cotidiana).",
        "Estruturação dos 3 Destaques Principais: 'Sobre Mim' (humanização), 'VIP/Segredo' (provas e antecipação), 'Mimos Grátis' (atração de lead).",
        "Publicação de 6 fotos espontâneas no feed para quebrar o visual vazio."
      ],
      evidence: "Perfil criado com bio intrigante: 'Estudante de moda tentando pagar a FAAP 🌸'. Destaques estruturados mostrando desenhos e mimos dos fãs.",
      improvements: "Criar Reels focados em ganchos geeks (ex: arrumando prateleira de mangás ou mostrando processo de costura de cosplay).",
      aiAdvice: "A bio está excelente. Mantenha os stories bem caseiros e use as músicas em alta no TikTok/Insta do estilo Lofi ou J-Pop suave."
    },
    {
      stepId: 3,
      title: "Setup Técnico (Pixel, ManyChat, Telegram)",
      description: "Ligar pixel, criar contingência de link, montar automações ManyChat e os canais do robô.",
      status: "Concluído",
      completedTasks: [
        "Criação de BM de Contingência (Business Manager) + Aquecimento de Conta de Anúncios.",
        "Criação do Pixel Meta e compartilhamento com as Contas de Anúncios de Contingência.",
        "Configuração das automações no ManyChat (Respostas automáticas para o direct 'QUERO').",
        "Criação e customização do Canal Grátis e Canal VIP no Telegram.",
        "Configuração e teste do Bot de Cobrança e Vendas integrado no canal principal do Telegram."
      ],
      evidence: "Robô ManyChat integrado respondendo a palavra 'ANIME' com áudio simulado ultra realista chamando de 'Senpai' e convidando para o grupo grátis.",
      improvements: "Ajustar o tempo de simulação de digitação para 4 segundos antes de disparar o áudio para máxima naturalidade.",
      aiAdvice: "O termo 'Senpai' cria um gatilho de intimidade imediato e divertido que aumenta em 30% a taxa de entrada no canal do Telegram."
    },
    {
      stepId: 4,
      title: "Esteira de Produtos e Ofertas",
      description: "Configurar front agressivo, orderbump e upsells/downsells sequenciais.",
      status: "Concluído",
      completedTasks: [
        "Definição e cadastro do Front-End irresistível (VIP Diário/Mensal a preço absurdamente baixo: R$ 9,90).",
        "Desenho do Orderbump na tela de checkout (ex: + Grupo Close Friends por R$ 5,00).",
        "Criação de 3 Ofertas de Upsell Sequenciais (ex: Vídeo Fetiche R$ 19, - WhatsApp Privado R$ 39, - Vídeo Chamada de 10 min R$ 79)."
      ],
      evidence: "Front-end 'Acesso Canal VIP' cadastrado a R$ 14,90/mês. Orderbump de 'Close Friends Secreto' por R$ 6,90 com alta aderência. Upsell 1 de 'Kimono Transparente' por R$ 29,90.",
      improvements: "Configurar Downsell imediato oferecendo o pack de fotos 'Inocente mas nem tanto' por R$ 7,90 para quem abandonar o checkout.",
      aiAdvice: "O ticket médio pode ser otimizado incluindo um super Upsell focado em áudios de ASMR personalizados sussurrados por R$ 49,90."
    },
    {
      stepId: 5,
      title: "Calendário e Produção de Conteúdo",
      description: "Planejar cronograma diário, ganchos provocativos e publicações automatizadas.",
      status: "Em andamento",
      completedTasks: [
        "Criação do calendário de postagens diárias (Manhã: Bom dia íntimo / Tarde: Pergunta picante / Noite: CTA ManyChat).",
        "Roteirização de Reels focado em curiosidade extrema com gancho que obriga o usuário a interagir."
      ],
      evidence: "Cronograma ativo. Postando Reels diários mostrando ela provando meias calças ou costurando cosplays com transições provocantes.",
      improvements: "Aumentar a frequência de Stories com enquetes interativas (ex: 'Qual cosplay devo usar hoje no VIP?').",
      aiAdvice: "Enquetes nos Stories aumentam o engajamento orgânico do algoritmo e criam antecipação para o conteúdo pago."
    },
    {
      stepId: 6,
      title: "Lançamento e Teste de Campanhas Ads",
      description: "Colocar campanha ABO de vendas para rodar testando públicos e criativos casuais.",
      status: "Em andamento",
      completedTasks: [
        "Preparação de criativos Meta Ads no formato 'Selfie amadora' e 'Vídeo curto tremido em frente ao espelho' (foge de cara de anúncio).",
        "Configuração de campanha de Venda ABO com estrutura 1-3-1 (1 campanha, 3 conjuntos de públicos de interesse abertos, 1 criativo vencedor por conjunto)."
      ],
      evidence: "Campanha ativa de teste com orçamento de R$ 40/dia direcionada para interesses geeks (Animes, Comic-Con, Crunchyroll). CTR de 6.4% no criativo selfie.",
      improvements: "Criar novo criativo focado em vídeo curto dela de costas mostrando o cabelo com meias longas e virando timidamente.",
      aiAdvice: "O público de anime responde extremamente bem a cores contrastantes de LED azul/rosa nos criativos."
    },
    {
      stepId: 7,
      title: "Otimização, Scaling e Retenção",
      description: "Crescer orçamento de anúncios validados e criar picos de faturamento interno no Telegram.",
      status: "Não iniciado",
      completedTasks: [],
      evidence: "",
      improvements: "",
      aiAdvice: ""
    },
    {
      stepId: 8,
      title: "Análise e Ajustes",
      description: "Revisar as margens financeiras, reavaliar contingências de links.",
      status: "Não iniciado",
      completedTasks: [],
      evidence: "",
      improvements: "",
      aiAdvice: ""
    }
  ],
  calendar: [
    { id: "cal-m-1", platform: "Instagram", type: "Reels", hook: "Arrume-se comigo para o evento Geek 🌸", desc: "Mostra ela de moletom largo e transição rápida para um cosplay de colegial estilizado. CTA: Comente ANIME para o direct secreto.", published: true, date: "2026-06-12" },
    { id: "cal-m-2", platform: "Instagram", type: "Stories", hook: "Estudando estampas japonesas no quarto", desc: "Mostra o caderno de desenhos e foca no seu rosto tímido de óculos. 'Pensando em um ensaio bem especial para o VIP...'", published: true, date: "2026-06-13" },
    { id: "cal-m-3", platform: "Telegram", type: "Prévia Grátis", hook: "Áudio ASMR Sussurrado de Boa Noite", desc: "Diz sussurrando bem pertinho do microfone que está sem sono e acabou de liberar o vídeo completo do cosplay de Kimono no VIP.", published: false, date: "2026-06-14" }
  ],
  campaigns: [
    { id: "camp-m-1", name: "[ABO] Maya - Teste Públicos Otaku/Geek", type: "ABO", budget: 40.00, structure: "1-3-1", leadCtr: 6.4, saleCtr: 1.9, roi: 2.3, note: "Público focado em Crunchyroll e Animes convertendo com menor CPA. Ampliar orçamento de criativos geeks.", status: "Ativo" }
  ],
  products: [
    { id: "prod-m-1", type: "Front", name: "Canal VIP Secreto da Maya - Mensal", price: 14.90, description: "Acesso ao canal fechado com postagens cotidianas, áudios sussurrados e fotos geeks exclusivas.", isActive: true },
    { id: "prod-m-2", type: "Orderbump", name: "+ Acesso Close Friends Secreto", price: 6.90, description: "Stories mais ousados do cotidiano dela na Liberdade e bastidores.", isActive: true },
    { id: "prod-m-3", type: "Upsell", name: "Pack Especial Cosplay Gatinha de Kimono", price: 29.90, description: "Ensaio fotográfico temático completo e vídeo caseiro exclusivo de 8 minutos.", isActive: true },
    { id: "prod-m-4", type: "Upsell", name: "WhatsApp Privado com a Maya (Vagas Limitadas)", price: 59.90, description: "Interação real diretamente com ela por áudio e texto no celular.", isActive: true }
  ],
  notes: "Maya Fujii tem excelente apelo em públicos geeks e gamers paulistas de ticket alto. O LTV pode ser muito escalado por meio de venda de packs temáticos sob encomenda nos directs.",
  logs: [
    { id: "log-m-1", timestamp: "2026-06-10 11:15", text: "Persona da Maya Fujii validada e assets visuais de consistência gerados." },
    { id: "log-m-2", timestamp: "2026-06-11 15:30", text: "ManyChat configurado para responder gatilho ANIME com áudio personalizado." }
  ]
};

