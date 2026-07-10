/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Circle,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  Lightbulb,
  Coins,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  CheckSquare,
  Square,
  HelpCircle,
  Edit2,
  Image,
  Sun,
  Moon,
  ExternalLink,
  Bookmark,
  Link,
  LogOut
} from 'lucide-react';
import { ModelProfile, Product, Campaign, CalendarItem, FunnelStep } from './types';
import { INITIAL_PROFILES, INITIAL_PRODUCTS_TEMPLATES, STEP_CHECKLISTS, MAYA_FUJII_PROFILE } from './data';
import { auth } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getUserProfiles, saveUserProfile, deleteUserProfile, seedDefaultProfiles } from './lib/firestoreService';
import AuthScreen from './components/AuthScreen';

// Helper to make fetch calls to /api/generate with dynamic Gemini & OpenRouter API Key support
const apiGenerateFetch = async (url: string, init?: RequestInit) => {
  const customKey = localStorage.getItem('custom_gemini_api_key') || '';
  const openRouterKey = localStorage.getItem('custom_openrouter_api_key') || '';
  const openRouterModel = localStorage.getItem('custom_openrouter_model') || 'google/gemini-2.5-flash';

  const headers = {
    ...(init?.headers || {}),
  } as Record<string, string>;
  
  if (customKey) {
    headers['x-gemini-api-key'] = customKey;
  }
  if (openRouterKey) {
    headers['x-openrouter-api-key'] = openRouterKey;
    headers['x-openrouter-model'] = openRouterModel;
  }
  
  let newInit = {
    ...init,
    headers,
  };

  // Inject keys directly into the body as well to bypass gateway/proxy header stripping
  if (init?.method === 'POST' && init.body && typeof init.body === 'string') {
    try {
      const parsedBody = JSON.parse(init.body);
      parsedBody.customApiKey = customKey;
      parsedBody.customOpenRouterApiKey = openRouterKey;
      parsedBody.customOpenRouterModel = openRouterModel;
      newInit.body = JSON.stringify(parsedBody);
    } catch (e) {
      console.error("Error injecting keys in body:", e);
    }
  }
  
  return fetch(url, newInit);
};

export default function App() {
  // Custom Google Gemini API Key state & handlers
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });
  const [tempKey, setTempKey] = useState<string>(() => {
    return localStorage.getItem('custom_gemini_api_key') || '';
  });
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);

  // Custom OpenRouter API Key state & handlers
  const [customOpenRouterKey, setCustomOpenRouterKey] = useState<string>(() => {
    return localStorage.getItem('custom_openrouter_api_key') || '';
  });
  const [customOpenRouterModel, setCustomOpenRouterModel] = useState<string>(() => {
    return localStorage.getItem('custom_openrouter_model') || 'google/gemini-2.5-flash';
  });
  const [tempOpenRouterKey, setTempOpenRouterKey] = useState<string>(() => {
    return localStorage.getItem('custom_openrouter_api_key') || '';
  });
  const [tempOpenRouterModel, setTempOpenRouterModel] = useState<string>(() => {
    return localStorage.getItem('custom_openrouter_model') || 'google/gemini-2.5-flash';
  });
  const [showOpenRouterInput, setShowOpenRouterInput] = useState<boolean>(false);

  const saveCustomOpenRouterKey = () => {
    const cleanKey = tempOpenRouterKey.trim();
    if (!cleanKey) return;
    localStorage.setItem('custom_openrouter_api_key', cleanKey);
    localStorage.setItem('custom_openrouter_model', tempOpenRouterModel.trim());
    setCustomOpenRouterKey(cleanKey);
    setCustomOpenRouterModel(tempOpenRouterModel.trim());
    setShowOpenRouterInput(false);
    alert('Sua chave de API do OpenRouter foi salva com sucesso! O sistema usará a API do OpenRouter com o modelo especificado.');
  };

  const clearCustomOpenRouterKey = () => {
    localStorage.removeItem('custom_openrouter_api_key');
    localStorage.removeItem('custom_openrouter_model');
    setCustomOpenRouterKey('');
    setCustomOpenRouterModel('google/gemini-2.5-flash');
    setTempOpenRouterKey('');
    setTempOpenRouterModel('google/gemini-2.5-flash');
    setShowOpenRouterInput(false);
  };

  const saveCustomKey = () => {
    const cleanKey = tempKey.trim();
    if (!cleanKey) return;
    localStorage.setItem('custom_gemini_api_key', cleanKey);
    setCustomApiKey(cleanKey);
    setShowKeyInput(false);
  };

  const clearCustomKey = () => {
    localStorage.removeItem('custom_gemini_api_key');
    setCustomApiKey('');
    setTempKey('');
    setShowKeyInput(false);
  };

  // Theme state & local persistence
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('hotfunnel-theme') as 'dark' | 'light') || 'dark';
  });
  const [productSuiteLoading, setProductSuiteLoading] = useState(false);

  // Synchronize theme with document
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('hotfunnel-theme', nextTheme);
  };

  // Profiles state - initialized from localStorage or defaults
  const [profiles, setProfiles] = useState<ModelProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'home' | 'workspace' | 'knowledge' | 'generator'>('home');
  const [selectedStageId, setSelectedStageId] = useState<number>(1);
  
  // Workspace active sub-tab
  const [workspaceSubTab, setWorkspaceSubTab] = useState<'insights' | 'wizard' | 'products' | 'ads' | 'calendar' | 'logs'>('insights');
  
  // Guided task states for AI instructions on specific tasks
  const [guidedTask, setGuidedTask] = useState<{ stepId: number; stepTitle: string; taskText: string } | null>(null);
  const [guidedTaskLoading, setGuidedTaskLoading] = useState<boolean>(false);
  const [guidedTaskAdvice, setGuidedTaskAdvice] = useState<string>('');

  // Form states for saving Reddit / nsfwdog favorite pages
  const [newRedditUrl, setNewRedditUrl] = useState<string>('');
  const [newRedditLabel, setNewRedditLabel] = useState<string>('');
  const [newRedditNotes, setNewRedditNotes] = useState<string>('');

  // States for analyzing favorites and auto-suggest subreddits
  const [analyzingFavorites, setAnalyzingFavorites] = useState<boolean>(false);
  const [favoritesAnalysisResult, setFavoritesAnalysisResult] = useState<string | null>(null);
  const [suggestingSubreddits, setSuggestingSubreddits] = useState<boolean>(false);
  const [suggestedSubreddits, setSuggestedSubreddits] = useState<any[] | null>(null);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState<boolean>(false);
  
  // User Authentication State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [confirmLogoutSidebar, setConfirmLogoutSidebar] = useState<boolean>(false);
  const [confirmLogoutHeader, setConfirmLogoutHeader] = useState<boolean>(false);

  // Load and sync data with Firestore and Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setConfirmLogoutSidebar(false);
      setConfirmLogoutHeader(false);
      if (currentUser) {
        setAuthLoading(true);
        const userEmail = currentUser.email?.toLowerCase() || '';
        const isDefaultSeedUser = userEmail === 'ph4608@gmail.com';
        
        try {
          // Fetch from Firestore
          let dbProfiles = await getUserProfiles(currentUser.uid);
          if (dbProfiles.length === 0) {
            if (isDefaultSeedUser) {
              // Seed defaults for the designated user
              dbProfiles = await seedDefaultProfiles(currentUser.uid);
            } else {
              // Other users start with an empty dashboard
              dbProfiles = [];
            }
          }

          // Force-add Maya Fujii for designated accounts if not already present
          const isMayaTargetUser = userEmail === 'ph4608@gmail.com' || userEmail === 'produtospack8@gmail.com';
          if (isMayaTargetUser) {
            const hasMaya = dbProfiles.some(p => p.name.toLowerCase().includes('maya') || p.id.includes('maya'));
            if (!hasMaya) {
              const mayaId = `perfil-maya-fujii-${currentUser.uid}`;
              const newMayaProfile: ModelProfile = {
                ...MAYA_FUJII_PROFILE,
                id: mayaId
              };
              try {
                await saveUserProfile(currentUser.uid, newMayaProfile);
                dbProfiles.push(newMayaProfile);
                console.log("Perfil da Maya Fujii adicionado com sucesso!");
              } catch (saveErr) {
                console.error("Erro ao salvar perfil da Maya no Firestore:", saveErr);
              }
            }
          }

          setProfiles(dbProfiles);
          // Sync locally too
          localStorage.setItem('hotfunnel_profiles', JSON.stringify(dbProfiles));
          
          if (dbProfiles.length > 0) {
            setActiveProfileId(dbProfiles[0].id);
          } else {
            setActiveProfileId('');
          }
        } catch (err) {
          console.error("Erro carregando dados do Firestore, usando fallback local:", err);
          // Fallback to localStorage
          const saved = localStorage.getItem('hotfunnel_profiles');
          if (saved) {
            try {
              setProfiles(JSON.parse(saved));
            } catch (e) {
              setProfiles(isDefaultSeedUser ? INITIAL_PROFILES : []);
            }
          } else {
            setProfiles(isDefaultSeedUser ? INITIAL_PROFILES : []);
          }
        } finally {
          setAuthLoading(false);
        }
      } else {
        setProfiles([]);
        setActiveProfileId('');
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync to localStorage and Firestore
  const saveToLocalStorage = (updatedProfiles: ModelProfile[]) => {
    localStorage.setItem('hotfunnel_profiles', JSON.stringify(updatedProfiles));
    setProfiles(updatedProfiles);
    
    // Save to Firestore in background
    if (user) {
      updatedProfiles.forEach((p) => {
        saveUserProfile(user.uid, p).catch((err) =>
          console.error("Erro ao salvar perfil no Firestore:", err)
        );
      });
    }
  };

  // Set default active if profile deleted or empty
  useEffect(() => {
    if (profiles.length > 0 && !activeProfileId) {
      setActiveProfileId(profiles[0].id);
    }
  }, [profiles, activeProfileId]);

  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId) || null;
  }, [profiles, activeProfileId]);

  // Global search & library query
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Copilot state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Step-level AI advice cache
  const [stepAiLoading, setStepAiLoading] = useState<{ [key: number]: boolean }>({});

  // -------------------------------------------------------------
  // CRUD Actions
  // -------------------------------------------------------------
  
  // Create a brand new empty profile
  const handleCreateProfile = () => {
    const newId = `perfil-${Date.now()}`;
    const newSteps: FunnelStep[] = Object.keys(STEP_CHECKLISTS).map(key => {
      const stepId = parseInt(key);
      return {
        stepId,
        title: getStepTitle(stepId),
        description: getStepDescription(stepId),
        status: 'Não iniciado',
        completedTasks: [],
        evidence: '',
        improvements: '',
        aiAdvice: ''
      };
    });

    const newProfile: ModelProfile = {
      id: newId,
      name: "Nova Modelo",
      startDate: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=400&h=400&q=80",
      persona: {
        rostro: "Descreva a consistência física do rosto (para geração por IA). Ex: Morena, cabelos ondulados, olhos pretos marcantes.",
        alma: "Qual o arquétipo psicológico, hobbies de front e fetiches que ativam a intimidade?",
        corpo: "Estilo e traços físicos marcantes (Ex: Mignon, fitness, coxas grossas).",
        historia: "Backstory de conexão humana. Por que ela vende conteúdo? Ex: pagar formatura, viagem secreta."
      },
      funnelSteps: newSteps,
      calendar: [
        { id: `cal-n-1`, platform: "Instagram", type: "Stories", hook: "Bom dia rotina amadora", desc: "Foto acordando e bebendo copo d'água com moletom sutil.", published: false, date: new Date().toISOString().split('T')[0] }
      ],
      campaigns: [],
      products: [...INITIAL_PRODUCTS_TEMPLATES],
      notes: "Escreva aqui lembretes operacionais desta modelo.",
      logs: [{ id: `log-${Date.now()}`, timestamp: getFormattedDate(), text: "Perfil criado no HotFunnel Manager." }]
    };

    const updated = [...profiles, newProfile];
    saveToLocalStorage(updated);
    setActiveProfileId(newId);
    setActiveTab('workspace');
    setWorkspaceSubTab('insights');
  };

  // Clone an existing profile
  const handleCloneProfile = (profile: ModelProfile) => {
    const newId = `perfil-clone-${Date.now()}`;
    const clonedProfile: ModelProfile = {
      ...JSON.parse(JSON.stringify(profile)),
      id: newId,
      name: `${profile.name} (Cópia)`,
      startDate: new Date().toISOString().split('T')[0],
      logs: [{ id: `log-${Date.now()}`, timestamp: getFormattedDate(), text: `Perfil clonado de ${profile.name}.` }]
    };

    const updated = [...profiles, clonedProfile];
    saveToLocalStorage(updated);
    setActiveProfileId(newId);
  };

  // Delete a profile
  const handleDeleteProfile = async (id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    saveToLocalStorage(updated);
    
    if (user) {
      try {
        await deleteUserProfile(id);
      } catch (err) {
        console.error("Erro deletando perfil do Firestore:", err);
      }
    }
    
    if (activeProfileId === id && updated.length > 0) {
      setActiveProfileId(updated[0].id);
    } else if (updated.length === 0) {
      setActiveProfileId('');
    }
  };

  // Save/favorite a Reddit page / nsfwdog link
  const handleSaveRedditPage = () => {
    if (!activeProfile) return;
    if (!newRedditUrl.trim()) {
      alert('Por favor, insira o link ou nome do subreddit.');
      return;
    }

    let processedUrl = newRedditUrl.trim();
    // If they typed just a name or subreddit shorthand (e.g., "Amateur" or "r/Amateur"), normalize it to nsfwdog.com
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      let cleanSub = processedUrl;
      if (cleanSub.startsWith('r/')) {
        cleanSub = cleanSub.substring(2);
      } else if (cleanSub.startsWith('/r/')) {
        cleanSub = cleanSub.substring(3);
      }
      processedUrl = `https://nsfwdog.com/sub/${cleanSub}`;
    } else {
      // If they typed a full URL but with /r/, let's normalize /r/ to /sub/ to avoid 404
      processedUrl = processedUrl.replace('nsfwdog.com/r/', 'nsfwdog.com/sub/');
    }

    const labelText = newRedditLabel.trim() || newRedditUrl.trim();
    const notesText = newRedditNotes.trim();

    const newPage = {
      id: `reddit-${Date.now()}`,
      url: processedUrl,
      label: labelText,
      notes: notesText || undefined
    };

    const currentSaved = activeProfile.savedRedditPages || [];
    const updatedProfile = {
      ...activeProfile,
      savedRedditPages: [...currentSaved, newPage]
    };

    updateProfileData(updatedProfile, `Salvou subreddit de referência: "${labelText}" (${processedUrl})`);

    // Reset inputs
    setNewRedditUrl('');
    setNewRedditLabel('');
    setNewRedditNotes('');
  };

  // Delete a saved Reddit page
  const handleDeleteRedditPage = (id: string) => {
    if (!activeProfile) return;
    const currentSaved = activeProfile.savedRedditPages || [];
    const updatedProfile = {
      ...activeProfile,
      savedRedditPages: currentSaved.filter(p => p.id !== id)
    };
    updateProfileData(updatedProfile, `Removeu subreddit de referência dos favoritos.`);
  };

  // Analyze Saved Favorites with AI
  const handleAnalyzeFavoritesWithAI = async () => {
    if (!activeProfile) return;
    const saved = activeProfile.savedRedditPages || [];
    if (saved.length === 0) {
      alert('Por favor, adicione pelo menos uma página ou subreddit favorito para analisar.');
      return;
    }

    setAnalyzingFavorites(true);
    setFavoritesAnalysisResult(null);

    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze-reddit-favorites',
          context: {
            name: activeProfile.name,
            rostro: activeProfile.persona.rostro,
            corpo: activeProfile.persona.corpo,
            alma: activeProfile.persona.alma,
            historia: activeProfile.persona.historia,
            savedPages: saved
          }
        })
      });
      const data = await res.json();
      if (data.text) {
        setFavoritesAnalysisResult(data.text);
      } else {
        setFavoritesAnalysisResult('Lamento, não foi possível gerar o relatório de análise tática no momento.');
      }
    } catch (err) {
      console.error(err);
      setFavoritesAnalysisResult('Erro de conexão ao servidor de IA.');
    } finally {
      setAnalyzingFavorites(false);
    }
  };

  // Auto suggest subreddits based on Persona details
  const handleSuggestSubredditsWithAI = async () => {
    if (!activeProfile) return;
    setSuggestingSubreddits(true);
    setSuggestedSubreddits(null);
    setShowSuggestionsPanel(true);

    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'suggest-subreddits',
          context: {
            name: activeProfile.name,
            rostro: activeProfile.persona.rostro,
            corpo: activeProfile.persona.corpo,
            alma: activeProfile.persona.alma,
            historia: activeProfile.persona.historia
          }
        })
      });
      const data = await res.json();
      if (data.text) {
        let parsed = null;
        try {
          parsed = JSON.parse(data.text);
        } catch (e) {
          // If the AI returned markdown fences or extra wrapper text, regex-extract the json block or array
          const match = data.text.match(/\[\s*\{[\s\S]*\}\s*\]/) || data.text.match(/\{\s*[\s\S]*\}/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (inner) {
              console.error(inner);
            }
          }
        }

        let parsedArray = null;
        if (Array.isArray(parsed)) {
          parsedArray = parsed;
        } else if (parsed && typeof parsed === 'object') {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray((parsed as any)[key])) {
              parsedArray = (parsed as any)[key];
              break;
            }
          }
        }

        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          setSuggestedSubreddits(parsedArray);
        } else {
          setSuggestedSubreddits([]);
        }
      } else {
        setSuggestedSubreddits([]);
      }
    } catch (err) {
      console.error(err);
      setSuggestedSubreddits([]);
    } finally {
      setSuggestingSubreddits(false);
    }
  };

  // Add a suggested page directly to favorites
  const handleSaveSuggestedPage = (suggested: { url: string; label: string; notes?: string }) => {
    if (!activeProfile) return;
    
    const cleanUrl = suggested.url.replace('nsfwdog.com/r/', 'nsfwdog.com/sub/');
    const currentSaved = activeProfile.savedRedditPages || [];
    if (currentSaved.some(p => p.url === cleanUrl)) {
      alert('Esta página já está salva em seus favoritos!');
      return;
    }

    const newPage = {
      id: `reddit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      url: cleanUrl,
      label: suggested.label,
      notes: suggested.notes
    };

    const updatedProfile = {
      ...activeProfile,
      savedRedditPages: [...currentSaved, newPage]
    };

    updateProfileData(updatedProfile, `Salvou subreddit sugerido por IA: "${suggested.label}" (${cleanUrl})`);
    alert(`"${suggested.label}" foi adicionado aos favoritos com sucesso!`);
  };

  // Helper date
  function getFormattedDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // Update profile field was refactored to support optional log entry in a single transaction
  const updateProfileData = (updated: ModelProfile, logMessage?: string) => {
    let finalProfile = updated;
    if (logMessage) {
      const updatedLogs = [
        { id: `log-${Date.now()}`, timestamp: getFormattedDate(), text: logMessage },
        ...updated.logs
      ];
      finalProfile = {
        ...updated,
        logs: updatedLogs
      };
    }
    const updatedProfiles = profiles.map(p => p.id === finalProfile.id ? finalProfile : p);
    saveToLocalStorage(updatedProfiles);
  };

  // Add a log entry - wrapper for updateProfileData
  const addProfileLog = (profile: ModelProfile, text: string) => {
    updateProfileData(profile, text);
  };

  // Calculate funnel progress (0-100) based on checked tasks of all 8 steps
  const getFunnelProgress = (profile: ModelProfile) => {
    let totalTasksCount = 0;
    let completedTasksCount = 0;
    
    profile.funnelSteps.forEach(step => {
      const stepChecklists = STEP_CHECKLISTS[step.stepId] || [];
      totalTasksCount += stepChecklists.length;
      completedTasksCount += step.completedTasks.length;
    });

    if (totalTasksCount === 0) return 0;
    return Math.round((completedTasksCount / totalTasksCount) * 100);
  };

  // Step translation helpers
  function getStepTitle(id: number): string {
    const titles: { [key: number]: string } = {
      1: "Persona + Criação da Modelo (assets IA)",
      2: "Estruturação das Redes Sociais de Captação (IG, TT, FB)",
      3: "Setup Técnico (Pixel Meta, BM, ManyChat, Telegram)",
      4: "Esteira de Produtos e Ofertas (Micro-tickets, Upsell, Downsell)",
      5: "Calendário e Produção de Conteúdo (Ganchos, Stories, CTAs)",
      6: "Lançamento e Teste de Campanhas Ads (ABO/CBO)",
      7: "Otimização, Scaling e Retenção",
      8: "Análise, Métricas e Ajustes de Margens"
    };
    return titles[id] || `Etapa ${id}`;
  }

  function getStepDescription(id: number): string {
    const descs: { [key: number]: string } = {
      1: "Gere looks autênticos mantendo rostos persistentes e defina os desejos ocultos masculinos.",
      2: "Arrume a fachada do Instagram para converter o topo do funil e prepare destaques persuasivos.",
      3: "Arrume as ferramentas de direcionamento e prepare as automações do ManyChat e grupos Telegram.",
      4: "Crie ofertas irresistíveis com preço base de R$ 9,90 e maximize as vendas casadas imediatas.",
      5: "Poste com ganchos misteriosos de rotina doméstica ou tímidos que conduzam para o chat.",
      6: "Suba anúncios de engajamento e vendas mascarando ofertas em selfies comuns.",
      7: "Aperte o parafuso do pós-venda e duplique orçamentos das campanhas com alto retorno.",
      8: "Verifique o custo de aquisição final do lead e a estabilidade das contas de contingências."
    };
    return descs[id] || "";
  }

  // -------------------------------------------------------------
  // AI Integrations with Server API
  // -------------------------------------------------------------
  const [fieldLoading, setFieldLoading] = useState<{ [key: string]: boolean }>({});
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<string>('');

  const autocompletePersonaField = async (field: 'rostro' | 'alma' | 'corpo' | 'historia') => {
    if (!activeProfile) return;
    setFieldLoading(prev => ({ ...prev, [field]: true }));
    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'persona-field-completion',
          context: {
            field,
            currentValue: activeProfile.persona[field],
            name: activeProfile.name,
            body: activeProfile.persona.corpo,
            soul: activeProfile.persona.alma,
            history: activeProfile.persona.historia
          }
        })
      });
      const data = await res.json();
      if (data.text) {
        const cleanedText = data.text.trim();
        const nextValue = cleanedText.replace(/^"|"$/g, ''); // remove wrapping quotes if generated
        const nextPersona = { ...activeProfile.persona, [field]: nextValue };
        updateProfileData({ ...activeProfile, persona: nextPersona }, `IA auto-completou/aprimorou o campo de persona: ${field}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFieldLoading(prev => ({ ...prev, [field]: false }));
    }
  };

  const generateAIPromptsForModel = async () => {
    if (!activeProfile) return;
    setPromptsLoading(true);
    setGeneratedPrompts('');
    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate-image-prompts',
          context: {
            name: activeProfile.name,
            rostro: activeProfile.persona.rostro,
            body: activeProfile.persona.corpo,
            soul: activeProfile.persona.alma,
            history: activeProfile.persona.historia
          }
        })
      });
      const data = await res.json();
      if (data.text) {
        setGeneratedPrompts(data.text);
      }
    } catch (err) {
      console.error(err);
      setGeneratedPrompts('Lamento, houve um erro ao processar os prompts pelo Estúdio de IA.');
    } finally {
      setPromptsLoading(false);
    }
  };
  
  // Custom AI request (e.g. Persona Critique, Global Generator)
  const askAICopilot = async (type: string, promptText: string, specificContext?: any) => {
    setAiLoading(true);
    setAiResponse('');
    
    // Fallback if no profile is active or specified
    const contextObj = specificContext || (activeProfile ? {
      name: activeProfile.name,
      rostro: activeProfile.persona.rostro,
      face: activeProfile.persona.rostro,
      alma: activeProfile.persona.alma,
      soul: activeProfile.persona.alma,
      corpo: activeProfile.persona.corpo,
      body: activeProfile.persona.corpo,
      historia: activeProfile.persona.historia,
      history: activeProfile.persona.historia
    } : null);

    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          prompt: promptText,
          context: contextObj
        })
      });

      const data = await res.json();
      setAiResponse(data.text);
    } catch (err) {
      console.error(err);
      setAiResponse("Lamento, houve um erro ao conectar-se ao Copiloto Hot. Rodando simulação local offline.");
    } finally {
      setAiLoading(false);
    }
  };

  // Generate the full custom product suite using AI
  const handleGenerateAiProductSuite = async () => {
    if (!activeProfile) return;
    setProductSuiteLoading(true);
    try {
      const contextObj = {
        name: activeProfile.name,
        corpo: activeProfile.persona.corpo,
        alma: activeProfile.persona.alma,
        historia: activeProfile.persona.historia,
        rostro: activeProfile.persona.rostro
      };
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate-product-suite',
          prompt: `Gerar esteira personalizada para ${activeProfile.name}`,
          context: contextObj
        })
      });
      const data = await res.json();
      if (data.text) {
        let parsed = null;
        try {
          // Attempt simple parse first
          parsed = JSON.parse(data.text);
        } catch (e) {
          // If the AI returned markdown fences or extra wrapper text, regex-extract the json block or array
          const match = data.text.match(/\[\s*\{[\s\S]*\}\s*\]/) || data.text.match(/\{\s*[\s\S]*\}/);
          if (match) {
            try {
              parsed = JSON.parse(match[0]);
            } catch (innerErr) {
              console.error("Inner parser error", innerErr);
            }
          }
        }

        let parsedArray = null;
        if (Array.isArray(parsed)) {
          parsedArray = parsed;
        } else if (parsed && typeof parsed === 'object') {
          for (const key of Object.keys(parsed)) {
            if (Array.isArray((parsed as any)[key])) {
              parsedArray = (parsed as any)[key];
              break;
            }
          }
        }

        if (Array.isArray(parsedArray) && parsedArray.length > 0) {
          const productsWithIds = parsedArray.map((p: any, idx: number) => ({
            id: `prod-ia-${p.type.toLowerCase()}-${Date.now()}-${idx}`,
            type: p.type || 'Upsell',
            name: p.name || 'Produto Personalizado',
            price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 19.90,
            description: p.description || 'Entrega de material exclusivo em anexo.',
            isActive: true
          }));
          
          updateProfileData({
            ...activeProfile,
            products: productsWithIds
          }, `Gerou uma esteira de produtos de alta conversão personalizada com IA.`);
          alert('Sua esteira de produtos foi totalmente re-gerada e personalizada com IA com base no backstory e características da modelo!');
        } else {
          alert('Lamento, não consegui extrair os produtos estruturados. Tente novamente.');
        }
      } else {
        alert('Carregamento de dados de resposta não pôde ser lido de maneira correta.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro de conexão ao servidor de IA.');
    } finally {
      setProductSuiteLoading(false);
    }
  };

  // Fetch advice for a specific stage
  const getStageAdviceFromAI = async (stepId: number) => {
    if (!activeProfile) return;
    
    setStepAiLoading(prev => ({ ...prev, [stepId]: true }));

    const contextObj = {
      name: activeProfile.name,
      soul: activeProfile.persona.alma,
      body: activeProfile.persona.corpo,
      history: activeProfile.persona.historia
    };

    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'funnel-step-advice',
          prompt: `Etapa ${stepId}: ${getStepTitle(stepId)}. Descrição: ${getStepDescription(stepId)}.`,
          context: contextObj
        })
      });

      const data = await res.json();
      
      const updatedSteps = activeProfile.funnelSteps.map(step => {
        if (step.stepId === stepId) {
          return { ...step, aiAdvice: data.text };
        }
        return step;
      });

      updateProfileData({
        ...activeProfile,
        funnelSteps: updatedSteps
      });

      addProfileLog(activeProfile, `Obteve recomendações de IA para a Etapa ${stepId}: ${getStepTitle(stepId)}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setStepAiLoading(prev => ({ ...prev, [stepId]: false }));
    }
  };

  // Get specific step-by-step guidance for a specific checklist task item
  const getTaskGuidanceFromAI = async (stepId: number, stepTitle: string, taskText: string) => {
    if (!activeProfile) return;
    
    setGuidedTask({ stepId, stepTitle, taskText });
    setGuidedTaskLoading(true);
    setGuidedTaskAdvice('');

    const contextObj = {
      name: activeProfile.name,
      alma: activeProfile.persona.alma,
      soul: activeProfile.persona.alma,
      corpo: activeProfile.persona.corpo,
      body: activeProfile.persona.corpo,
      historia: activeProfile.persona.historia,
      history: activeProfile.persona.historia,
      rostro: activeProfile.persona.rostro,
      face: activeProfile.persona.rostro,
      taskName: taskText,
      stepId: stepId,
      stepTitle: stepTitle
    };

    try {
      const res = await apiGenerateFetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'funnel-task-guidance',
          prompt: `Guie sobre como realizar a tarefa: "${taskText}" do passo ${stepId} (${stepTitle})`,
          context: contextObj
        })
      });

      const data = await res.json();
      if (data && data.text) {
        setGuidedTaskAdvice(data.text);
      } else {
        setGuidedTaskAdvice('Lamento, não consegui carregar o roteiro específico. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setGuidedTaskAdvice('Erro de conexão ao servidor de IA. Por favor, tente novamente mais tarde.');
    } finally {
      setGuidedTaskLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Import/Export System State as JSON
  // -------------------------------------------------------------
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `hotfunnel-backups-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files.length > 0) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].name) {
            saveToLocalStorage(parsed);
            setActiveProfileId(parsed[0].id);
            alert("Base de dados HotFunnel importada com sucesso!");
          } else {
            alert("Formato JSON de backup inválido.");
          }
        } catch (err) {
          alert("Falha na leitura do arquivo JSON.");
        }
      };
    }
  };

  // -------------------------------------------------------------
  // Knowledge Base Definitions
  // -------------------------------------------------------------
  const knowledgeBase = [
    {
      title: "Gargalo Crítico de Link no IG",
      category: "Segurança e Contingência",
      content: "Nunca coloque o link direto do OnlyFans/Privacy ou do checkout na bio do Instagram de Captação Orgânica. O Instagram penaliza o alcance orgânico e aumenta drásticamente o shadowban. Utilize ManyChat com gatilhos de Direct ('QUERO', 'MIMO') para qualificar o lead na conversa privada ou redirecionar para um Canal de Telegram de Prévias Grátis. Crie seu próprio Linktree amador mascarado para contingência ilimitada."
    },
    {
      title: "Arquitetura Rosto + Alma + Corpo + História",
      category: "Persona & IA",
      content: "Uma boa modelo deve possuir: ROSTO (Consistente, use SeaArt ou TensorArt para mimetizar poses do dia-a-dia); ALMA (Voz espontânea, humores mutáveis, vulnerabilidade controlada); CORPO (Perfeitamente amador, sem retoques artificiais extremos, poses no quarto); e HISTÓRIA (Uma lenda humana honesta e humilde, ex: pagar dentes da mãe, pagar mensalidade da faculdade). Isso gera empatia e desejo de apoio financeiro."
    },
    {
      title: "ABO vs CBO no Meta Ads",
      category: "Anúncios Meta Ads",
      content: "Use ABO (Orçamento ao nível de Conjunto de Anúncios) para testar novos criativos e públicos com garantias de verba idêntica por conjunto. Use CBO (Orçamento ao nível de Campanha) quando você já possui conjuntos validados e quer que a Inteligência do Meta direcione o dinheiro para os que estão trazendo o lead mais barato ou maiores taxas de inicialização de compra. Sempre duplique campanhas que perfomaram bem, nunca mexa direto no orçamento de campanhas ativas para não resetar o algoritmo."
    },
    {
      title: "A Esteira de Micro-ticket (Funil de Entrada)",
      category: "Esteira de Produtos",
      content: "O 'VIP Diário/Mensal' deve custar entre R$ 9,90 e R$ 14,90. É um preço de absoluto impulso que destrava a carteira do lead frio. O lucro real reside logo após a aprovação do pagamento: configure Orderbump no próprio checkout (Ex: WhatsApp da Modelo por +R$ 19,90) e de 2 a 3 telas consecutivas de Upsell com vídeos mais ousados (R$ 19, R$ 29, R$ 49) ou chamadas de vídeo rápidas de 5 minutos pelo aplicativo (R$ 79)."
    },
    {
      title: "O Pulo do Gato no Telegram Grátis",
      category: "Fechamento de Vendas",
      content: "Poste prévias no Canal Grátis diariamente. O conteúdo deve ser amador (estilo 'tirei de manhã enquanto me arrumava'). Insira CTAs (Chamadas para Ação) curtas e objetivas em absolutamente TODAS as fotos e áudios postados no Telegram. Enquetes interativas (ex: 'Que lingerie uso hoje?') aumentam o engajamento e preparam o público masculino para a oferta especial à noite."
    }
  ];

  const filteredKnowledge = knowledgeBase.filter(item => {
    const raw = (item.title + item.category + item.content).toLowerCase();
    return raw.includes(searchQuery.toLowerCase());
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center font-sans relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-rose-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col items-center space-y-4 relative z-10">
          <div className="bg-rose-600/10 border border-rose-500/30 p-3.5 rounded-2xl animate-bounce">
            <Flame className="w-8 h-8 text-rose-500" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></span>
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Carregando painel seguro...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={(u) => setUser(u)} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-900 selection:text-white">
      
      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-rose-600/10 border border-rose-500/30 p-2 rounded-lg animate-pulse">
            <Flame className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-rose-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">
              HotFunnel Manager
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">
              CO-PILOTO DE ALTA CONVERSÃO ADULTO
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="hidden lg:flex items-center space-x-6 text-xs text-slate-400">
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-rose-400" />
            <span>Perfis Ativos: <strong className="text-white">{profiles.length}</strong></span>
          </div>
          <div className="bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>ROI Médio Global: <strong className="text-white">
              {profiles.filter(p => (p.campaigns || []).length > 0).length > 0 
                ? `${(profiles.flatMap(p => p.campaigns || []).reduce((acc, c) => acc + c.roi, 0) / Math.max(1, profiles.flatMap(p => p.campaigns || []).length)).toFixed(1)}x` 
                : "Ainda sem tráfego"}
            </strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={() => {
                if (confirmLogoutHeader) {
                  signOut(auth);
                } else {
                  setConfirmLogoutHeader(true);
                  setTimeout(() => setConfirmLogoutHeader(false), 4000);
                }
              }}
              title={confirmLogoutHeader ? "Clique novamente para confirmar a saída" : "Desconectar / Sair da Conta"}
              className={`flex items-center space-x-1 px-2 py-2 border rounded-lg text-xs font-semibold transition active:scale-95 cursor-pointer ${
                confirmLogoutHeader
                  ? "bg-rose-600 hover:bg-rose-500 border-rose-500 text-white animate-pulse"
                  : "bg-rose-950/20 hover:bg-rose-950/50 border-rose-900/30 text-rose-400 hover:text-rose-300"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {confirmLogoutHeader ? "Confirmar Saída?" : `Sair (${user.email})`}
              </span>
              <span className="md:hidden">
                {confirmLogoutHeader ? "Confirmar?" : "Sair"}
              </span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ativar Tema Claro' : 'Ativar Tema Escuro'}
            className="p-2 rounded-lg border transition flex items-center justify-center text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border-slate-800"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-400" />}
          </button>

          <button
            onClick={handleExportData}
            title="Exportar Base (.json)"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-800 transition"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <label
            title="Importar Base (.json)"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 rounded-lg border border-slate-800 cursor-pointer transition"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          <button
            onClick={handleCreateProfile}
            className="flex items-center space-x-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-lg shadow-rose-950/40 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Modelo</span>
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT SPLIT */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* NAV BAR SIDEBAR */}
        <nav className="w-full md:w-64 bg-slate-950 border-r border-slate-900 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">OPERACIONAL</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setActiveTab('home')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'home' ? 'bg-rose-600/10 text-rose-400 border-l-2 border-rose-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                >
                  <Flame className="w-4 h-4" />
                  <span>Painel de Perfis</span>
                  <span className="ml-auto bg-slate-900 text-slate-300 text-xxs px-2 py-0.5 rounded-full">{profiles.length}</span>
                </button>

                <button
                  onClick={() => {
                    if (profiles.length > 0) {
                      setActiveTab('workspace');
                    } else {
                      alert('Crie um perfil para acessar o workspace de trabalho.');
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'workspace' ? 'bg-rose-600/10 text-rose-400 border-l-2 border-rose-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Configurar Funil</span>
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">GERADORES</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setActiveTab('generator');
                    setAiResponse('');
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'generator' ? 'bg-rose-600/10 text-rose-400 border-l-2 border-rose-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                >
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Estúdio de IA</span>
                </button>

                <button
                  onClick={() => setActiveTab('knowledge')}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === 'knowledge' ? 'bg-rose-600/10 text-rose-400 border-l-2 border-rose-500' : 'text-slate-400 hover:bg-slate-900/40 hover:text-slate-200'}`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Manual de Vendas</span>
                </button>
              </div>
            </div>

            {/* QUICK PROFILE PICKER */}
            {profiles.length > 0 && (
              <div className="pt-4 border-t border-slate-900">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">MODELO ATUAL</p>
                <select
                  value={activeProfileId}
                  onChange={(e) => {
                    setActiveProfileId(e.target.value);
                    if (activeTab !== 'workspace') {
                      setActiveTab('workspace');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-850 text-slate-200 py-1.5 px-3 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {activeProfile && (
                  <div className="mt-2.5 px-3 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-semibold">{activeProfile.status} • {getFunnelProgress(activeProfile)}% Funil</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* GEMINI API CONFIGURATION SECTION */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">CHAVE GEMINI API</span>
              {customApiKey ? (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Própria
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-pink-400" /> Padrão
                </span>
              )}
            </div>
            
            {showKeyInput ? (
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="Cole sua chave AI_KEY..."
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                />
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={saveCustomKey}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 transition text-white font-semibold text-[10px] py-1 rounded cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setShowKeyInput(false);
                      setTempKey(customApiKey);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 transition text-slate-300 rounded text-[10px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {customApiKey ? (
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] text-slate-500 block truncate max-w-[125px]">
                      ••••••••{customApiKey.slice(-4)}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => setShowKeyInput(true)}
                        className="text-[10px] text-slate-400 hover:text-white transition underline cursor-pointer"
                      >
                        Alterar
                      </button>
                      <button
                        onClick={clearCustomKey}
                        className="text-[10px] text-rose-400 hover:text-rose-300 transition underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Ganhe acesso a respostas ilimitadas e profundas sem os limites do pacote padrão fornecendo sua chave.
                    </p>
                    <button
                      onClick={() => setShowKeyInput(true)}
                      className="w-full mt-1 flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px] py-1 px-2 rounded transition border border-slate-700 cursor-pointer"
                    >
                      <span>Usar Minha Chave</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* OPENROUTER API CONFIGURATION SECTION */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider">CHAVE OPENROUTER API</span>
              {customOpenRouterKey ? (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Ativa
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[9px] font-bold flex items-center gap-1">
                  <Circle className="w-2.5 h-2.5 text-slate-500" /> Desativada
                </span>
              )}
            </div>
            
            {showOpenRouterInput ? (
              <div className="space-y-1.5">
                <input
                  type="password"
                  placeholder="Cole sua chave OpenRouter..."
                  value={tempOpenRouterKey}
                  onChange={(e) => setTempOpenRouterKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                />
                <input
                  type="text"
                  placeholder="Modelo (ex: google/gemini-2.5-flash)"
                  value={tempOpenRouterModel}
                  onChange={(e) => setTempOpenRouterModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                />
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={saveCustomOpenRouterKey}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 transition text-white font-semibold text-[10px] py-1 rounded cursor-pointer"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => {
                      setShowOpenRouterInput(false);
                      setTempOpenRouterKey(customOpenRouterKey);
                      setTempOpenRouterModel(customOpenRouterModel);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 transition text-slate-300 rounded text-[10px] cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {customOpenRouterKey ? (
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-[9px] text-slate-500 block truncate max-w-[125px]">
                        ••••••••{customOpenRouterKey.slice(-4)}
                      </span>
                      <span className="text-[8px] text-slate-400 block truncate max-w-[120px]">
                        Mod: {customOpenRouterModel}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => setShowOpenRouterInput(true)}
                        className="text-[10px] text-slate-400 hover:text-white transition underline cursor-pointer"
                      >
                        Alterar
                      </button>
                      <button
                        onClick={clearCustomOpenRouterKey}
                        className="text-[10px] text-rose-400 hover:text-rose-300 transition underline cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-500 leading-tight">
                      Use sua própria API Key do OpenRouter e selecione o modelo de IA de sua preferência.
                    </p>
                    <button
                      onClick={() => setShowOpenRouterInput(true)}
                      className="w-full mt-1 flex items-center justify-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[10px] py-1 px-2 rounded transition border border-slate-700 cursor-pointer"
                    >
                      <span>Usar OpenRouter</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* USER ACCOUNT SECTION */}
          {user && (
            <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-900/40 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider">CONTA CONECTADA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium truncate" title={user.email}>
                {user.email}
              </p>
              <button
                onClick={() => {
                  if (confirmLogoutSidebar) {
                    signOut(auth);
                  } else {
                    setConfirmLogoutSidebar(true);
                    setTimeout(() => setConfirmLogoutSidebar(false), 4000);
                  }
                }}
                className={`w-full text-center text-[9px] font-bold py-1.5 rounded border transition duration-150 cursor-pointer ${
                  confirmLogoutSidebar
                    ? "bg-rose-600 hover:bg-rose-500 border-rose-500 text-white animate-pulse"
                    : "bg-rose-950/20 hover:bg-rose-950/40 border-rose-900/30 text-rose-400 hover:text-rose-300"
                }`}
              >
                {confirmLogoutSidebar ? "Confirmar Desconexão?" : "Desconectar"}
              </button>
            </div>
          )}

          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/40 text-xxs text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Sessão Segura na Nuvem</span>
            <span>Seus dados de funis são sincronizados na nuvem do Firestore em tempo real.</span>
          </div>
        </nav>

        {/* CONTAINER CONTENT */}
        <main className="flex-1 bg-slate-950 p-6 overflow-y-auto">

          {/* ==========================================
              TAB 1: HOME PANEL / METRICS GRID
             ========================================== */}
          {activeTab === 'home' && (
            <div className="space-y-8 max-w-7xl mx-auto">
              
              {/* HERO CALLOUT */}
              <div className="relative bg-gradient-to-r from-rose-950/40 to-slate-950 border border-rose-900/20 rounded-2xl p-6 overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 max-w-2xl space-y-2">
                  <span className="text-xs text-rose-400 font-bold tracking-wider uppercase bg-rose-600/10 px-2 py-0.5 rounded">MODO CO-PILOTO</span>
                  <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Suas Operações de Venda Hot</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Bem-vindo à central de inteligência e conversão. Monitore cada etapa da captação de suas modelos virtuais, mantenha as esteiras de micro-tickets operando com ROI máximo e reduza o bloqueio nas redes sociais.
                  </p>
                </div>
              </div>

              {/* MODEL GRID CONTAINER */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Modelos Cadastradas</h3>
                  <p className="text-xs text-slate-500 font-medium">Toque em qualquer card para entrar no módulo operacional do funil.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map(profile => {
                    const progress = getFunnelProgress(profile);
                    return (
                      <div
                        key={profile.id}
                        className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 hover:border-rose-500/30 rounded-xl p-5 hover:shadow-xl hover:shadow-rose-950/10 transition duration-200 flex flex-col justify-between space-y-4 group relative"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3.5">
                            <img
                              src={profile.avatarUrl}
                              alt={profile.name}
                              className="w-12 h-12 rounded-full object-cover border border-slate-800 group-hover:border-rose-500/40 transition"
                            />
                            <div>
                              <h4 className="font-bold text-slate-100 group-hover:text-rose-400 transition text-base">
                                {profile.name}
                              </h4>
                              <p className="text-xxs text-slate-400">Início: {profile.startDate}</p>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            profile.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            profile.status === 'Em scaling' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                            profile.status === 'Precisa atenção' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {profile.status}
                          </span>
                        </div>

                        {/* Backstory Snippet */}
                        <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">
                          "{profile.persona.historia}"
                        </p>

                        {/* Progress bar */}
                        <div className="space-y-1.5">
                          <div className="flex text-xxs font-bold justify-between">
                            <span className="text-slate-400">Progresso do Funil</span>
                            <span className="text-rose-400">{progress}%</span>
                          </div>
                          <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Micro KPI indicators */}
                        <div className="grid grid-cols-2 gap-2 text-center text-xxs font-semibold">
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase">Canais / Links</span>
                            <span className="text-slate-200 font-bold block mt-0.5">
                              {(profile.calendar || []).length} Publicações
                            </span>
                          </div>
                          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <span className="text-slate-400 block text-[9px] uppercase">ROI Tráfego</span>
                            <span className="text-amber-400 font-extrabold block mt-0.5 animate-pulse">
                              {(profile.campaigns || []).length > 0 ? `${(profile.campaigns || [])[0].roi.toFixed(1)}x` : "0.0x"}
                            </span>
                          </div>
                        </div>

                        {/* Card Hover Action overlay footer */}
                        <div className="pt-2.5 border-t border-slate-850 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleCloneProfile(profile)}
                              className="text-[11px] text-slate-400 hover:text-white transition flex items-center space-x-1"
                              title="Criar cópia idêntica desta modelo"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Clonar</span>
                            </button>

                            {deletingId === profile.id ? (
                              <div className="flex items-center space-x-1.5 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-500/50 shadow-lg">
                                <span className="text-[10px] text-rose-300 font-extrabold whitespace-nowrap animate-pulse">Excluir?</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProfile(profile.id);
                                    setDeletingId(null);
                                  }}
                                  className="text-[10px] text-white bg-rose-600 hover:bg-rose-500 px-1.5 py-0.5 rounded font-extrabold transition cursor-pointer"
                                  title="Confirmar exclusão permanente"
                                >
                                  Sim
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeletingId(null);
                                  }}
                                  className="text-[10px] text-slate-400 hover:text-white px-1 py-0.5 rounded transition cursor-pointer"
                                >
                                  Não
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingId(profile.id);
                                }}
                                className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center space-x-1 cursor-pointer"
                                title="Excluir perfil e dados permanentemente"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500/80" />
                                <span className="font-semibold text-slate-400 hover:text-rose-400">Excluir</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => {
                              setActiveProfileId(profile.id);
                              setActiveTab('workspace');
                              setWorkspaceSubTab('insights');
                            }}
                            className="bg-slate-950 hover:bg-rose-900/40 text-slate-200 hover:text-rose-400 font-bold px-3 py-1.5 rounded-lg text-xs border border-slate-800 hover:border-rose-900/60 transition duration-150 flex items-center space-x-1 ml-2"
                          >
                            <span>Trabalhar</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* CREATE FIRST ENTRY CARD */}
                  <div
                    onClick={handleCreateProfile}
                    className="border-2 border-dashed border-slate-800/80 hover:border-rose-500/40 rounded-xl p-8 transition duration-200 flex flex-col items-center justify-center space-y-3 cursor-pointer hover:bg-slate-900/10 group"
                  >
                    <PlusCircle className="w-10 h-10 text-slate-400 group-hover:text-rose-500 transition" />
                    <p className="font-bold text-sm text-slate-300">Nova Modelo Virtual</p>
                    <p className="text-xxs text-slate-500 text-center leading-relaxed">
                      Crie do zero com avatar, backstory persistente, calendário operacional de tarefas e esteira de vendas integrada.
                    </p>
                  </div>
                </div>
              </div>

              {/* ADVERTISING SCALE WATCHDOG */}
              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <h4 className="font-bold text-sm text-slate-200">Recomendações Ativas de Escala de Tráfego</h4>
                </div>
                <div className="space-y-2.5">
                  {profiles.flatMap(p => p.campaigns || []).filter(c => c.roi >= 2.5 && c.status === 'Ativo').length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhuma campanha de Meta Ads validada atende aos critérios de escalonamento vertical (ROI &gt; 2.5x e CTR &gt; 6%).</p>
                  ) : (
                    profiles.flatMap(p => p.campaigns || []).filter(c => c.roi >= 2.5 && c.status === 'Ativo').map(camp => (
                      <div key={camp.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-bold text-rose-400">{camp.name}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">Estrutura: {camp.structure}</span>
                          </div>
                          <p className="text-xxs text-slate-400 mt-1">Criação de novos anúncios duplicados de engajamento sugeridos para expansão de contingência.</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-xxs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                            ROI: {camp.roi}x
                          </span>
                          <button 
                            onClick={() => {
                              const p = profiles.find(prof => (prof.campaigns || []).some(c => c.id === camp.id));
                              if (p) {
                                const updatedCampaigns = (p.campaigns || []).map(c => c.id === camp.id ? { ...c, budget: c.budget * 1.3, status: 'Escalado' as const } : c);
                                updateProfileData({ ...p, campaigns: updatedCampaigns }, `Aumentou verba da campanha de anúncios "${camp.name}" em 30% para escalonamento vertical rápido.`);
                                alert(`Campanha de anúncios "${camp.name}" escalada com sucesso! O orçamento diário foi aumentado em 30%.`);
                              }
                            }} 
                            className="bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800 text-rose-300 font-extrabold text-xxs px-3 py-1.5 rounded-lg transition"
                          >
                            Escalar Duplicação
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CONFIGURAR PERFORMANCE / WORKSPACE
             ========================================== */}
          {activeTab === 'workspace' && activeProfile && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* CURRENT PROFILE WORKING BANNER */}
              <div className="bg-slate-900/20 p-5 rounded-2xl border border-slate-850/80 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={activeProfile.avatarUrl}
                    alt={activeProfile.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-rose-500/30 shadow-inner"
                  />
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <h2 className="text-lg font-extrabold text-white leading-none">{activeProfile.name}</h2>
                      <span className="text-[10px] font-bold bg-slate-950 text-rose-400 px-2.5 py-0.5 border border-slate-800 rounded-full">
                        {activeProfile.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-1.5">
                      <span>Progresso do Funil: <strong className="text-white">{getFunnelProgress(activeProfile)}%</strong></span>
                      <span className="text-slate-705 hidden sm:inline">|</span>
                      <span>Início: <strong className="text-slate-300">{activeProfile.startDate}</strong></span>
                    </div>
                  </div>
                </div>

                {/* VISUAL CRUMB ROADMAP - ANTI-CONFUSION STEPS FOR LEIGO */}
                <div className="bg-slate-950/60 border border-slate-900/80 rounded-xl p-3 flex items-center space-x-4 overflow-x-auto w-full md:w-auto max-w-full">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider hidden lg:block border-r border-slate-900 pr-3 mr-1">Roteiro:</div>
                  {[
                    { sub: 'insights', num: '1', name: 'Persona' },
                    { sub: 'products', num: '2', name: 'Produtos' },
                    { sub: 'ads', num: '3', name: 'Trafego' },
                    { sub: 'wizard', num: '4', name: 'Cheque-Ins (8p)' },
                    { sub: 'calendar', num: '5', name: 'Calendário' },
                  ].map((s) => (
                    <button
                      key={s.sub}
                      onClick={() => setWorkspaceSubTab(s.sub as any)}
                      className={`flex items-center space-x-1.5 text-xxs font-extrabold whitespace-nowrap transition px-2 py-1 rounded-md ${
                        workspaceSubTab === s.sub
                          ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 flex items-center justify-center rounded-full text-[9px] ${
                        workspaceSubTab === s.sub ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'
                      }`}>{s.num}</span>
                      <span>{s.name}</span>
                    </button>
                  ))}
                </div>

                {/* Profile fast configuration parameters */}
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Nome da Modelo</label>
                    <input
                      type="text"
                      placeholder="Nome da Modelo..."
                      value={activeProfile.name}
                      onChange={(e) => {
                        updateProfileData({ ...activeProfile, name: e.target.value });
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none w-36 sm:w-40"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Status Operacional</label>
                    <select
                      value={activeProfile.status}
                      onChange={(e) => {
                        const next = e.target.value as any;
                        updateProfileData({ ...activeProfile, status: next }, `Alterou status operacional para: ${next}`);
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Em scaling">Em scaling</option>
                      <option value="Precisa atenção">Precisa atenção</option>
                      <option value="Concluído">Concluído</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">Mídias Disponíveis</label>
                    <input
                      type="text"
                      placeholder="Trocar Foto URL..."
                      value={activeProfile.avatarUrl}
                      onChange={(e) => {
                        updateProfileData({ ...activeProfile, avatarUrl: e.target.value });
                      }}
                      className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg text-xs py-1.5 px-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* HORIZONTAL WORKSPACE SUB-TABS */}
              <div className="border-b border-slate-900 flex space-x-2 overflow-x-auto pb-px">
                {[
                  { id: 'insights', label: 'Persona & Diagnóstico', icon: Info },
                  { id: 'wizard', label: 'Wizard do Funil (8 Passos)', icon: Flame },
                  { id: 'products', label: 'Esteira de Produtos', icon: Coins },
                  { id: 'ads', label: 'Tráfego e Ads', icon: TrendingUp },
                  { id: 'calendar', label: 'Conteúdo & Redes', icon: Calendar },
                  { id: 'logs', label: 'Histórico & Logs', icon: BookOpen },
                ].map(subTab => {
                  const IconComp = subTab.icon;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setWorkspaceSubTab(subTab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition duration-150 whitespace-nowrap ${
                        workspaceSubTab === subTab.id 
                          ? 'border-rose-500 text-rose-400 bg-rose-500/5' 
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                      }`}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                      <span>{subTab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ====================================================
                  SUBT-TAB A: INSIGHTS & PERSONA DEFINITION
                 ==================================================== */}
              {workspaceSubTab === 'insights' && (
                <div className="space-y-6">
                  {/* EXPLORATION HEADER GUIDE - Para o usuário não se sentir perdido */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Guia Visual da Persona</h4>
                      </div>
                      <p className="text-xs text-slate-300">
                        O primeiro segredo do tráfego hot é criar um contraste psicológico crível (a garota tímida que faz faculdade). Defina os detalhes abaixo ou preencha o início e clique em <strong>"Completar com IA"</strong> para expandir os traços.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* PERSONA EDITOR FORMS */}
                    <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <h3 className="font-bold text-sm text-slate-200">Rosto, Alma, Corpo & História da Modelo</h3>
                        <span className="text-[10px] text-slate-500 italic">Auto-preenchimento inteligente por campo</span>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Rosto Consistente (Aparência)</label>
                            <button
                              onClick={() => autocompletePersonaField('rostro')}
                              disabled={fieldLoading['rostro']}
                              className="text-xs text-rose-400 font-bold hover:text-rose-300 flex items-center space-x-1 cursor-pointer transition disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>{fieldLoading['rostro'] ? 'Estendendo...' : '✨ Completar com IA'}</span>
                            </button>
                          </div>
                          <textarea
                            rows={8}
                            placeholder="Ex: Rosto delicado, olhar inocente, covinhas marcantes nas bochechas..."
                            value={activeProfile.persona.rostro}
                            onChange={(e) => {
                              const newPersona = { ...activeProfile.persona, rostro: e.target.value };
                              updateProfileData({ ...activeProfile, persona: newPersona });
                            }}
                            className="w-full bg-slate-950/85 border-2 border-slate-800 focus:border-rose-500 rounded-xl text-md md:text-base leading-relaxed p-5 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Alma da Modelo (Arquétipo e voz)</label>
                            <button
                              onClick={() => autocompletePersonaField('alma')}
                              disabled={fieldLoading['alma']}
                              className="text-xs text-rose-400 font-bold hover:text-rose-300 flex items-center space-x-1 cursor-pointer transition disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>{fieldLoading['alma'] ? 'Estendendo...' : '✨ Completar com IA'}</span>
                            </button>
                          </div>
                          <textarea
                            rows={8}
                            placeholder="Ex: Vizinha inocente na faculdade, mas com pensamentos ardentes. Envia áudios caseiros tímidos..."
                            value={activeProfile.persona.alma}
                            onChange={(e) => {
                              const newPersona = { ...activeProfile.persona, alma: e.target.value };
                              updateProfileData({ ...activeProfile, persona: newPersona });
                            }}
                            className="w-full bg-slate-950/85 border-2 border-slate-800 focus:border-rose-500 rounded-xl text-md md:text-base leading-relaxed p-5 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Corpo e Físico (Traços amadores)</label>
                            <button
                              onClick={() => autocompletePersonaField('corpo')}
                              disabled={fieldLoading['corpo']}
                              className="text-xs text-rose-400 font-bold hover:text-rose-300 flex items-center space-x-1 cursor-pointer transition disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>{fieldLoading['corpo'] ? 'Estendendo...' : '✨ Completar com IA'}</span>
                            </button>
                          </div>
                          <textarea
                            rows={8}
                            placeholder="Ex: Corpo mignon natural, estilo atleta de academia com curvas sutis..."
                            value={activeProfile.persona.corpo}
                            onChange={(e) => {
                              const newPersona = { ...activeProfile.persona, corpo: e.target.value };
                              updateProfileData({ ...activeProfile, persona: newPersona });
                            }}
                            className="w-full bg-slate-950/85 border-2 border-slate-800 focus:border-rose-500 rounded-xl text-md md:text-base leading-relaxed p-5 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">História de Fundo (Backstory Emocional)</label>
                            <button
                              onClick={() => autocompletePersonaField('historia')}
                              disabled={fieldLoading['historia']}
                              className="text-xs text-rose-400 font-bold hover:text-rose-300 flex items-center space-x-1 cursor-pointer transition disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              <span>{fieldLoading['historia'] ? 'Estendendo...' : '✨ Completar com IA'}</span>
                            </button>
                          </div>
                          <textarea
                            rows={12}
                            placeholder="Ex: Veio de cidade pequena para cursar enfermagem na capital e abriu o perfil sigiloso para pagar o aluguel dos quartos estudantis..."
                            value={activeProfile.persona.historia}
                            onChange={(e) => {
                              const newPersona = { ...activeProfile.persona, historia: e.target.value };
                              updateProfileData({ ...activeProfile, persona: newPersona });
                            }}
                            className="w-full bg-slate-950/85 border-2 border-slate-800 focus:border-rose-500 rounded-xl text-md md:text-base leading-relaxed p-5 text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          />
                        </div>
                      </div>
                    </div>

                    {/* AI INSIGHTS DIAGNOSTIC */}
                    <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-pink-400" />
                            <h3 className="font-bold text-sm text-slate-200">Revisão Crítica da Modelo Pelo Copiloto Hot</h3>
                          </div>
                          <span className="text-[10px] text-rose-400 font-extrabold tracking-wider bg-rose-600/10 px-2 py-0.5 rounded">INTELIGÊNCIA ATIVA</span>
                        </div>

                        <div className="mt-4 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[300px] space-y-3.5 pr-2">
                          {aiResponse ? (
                            <div className="prose prose-invert prose-xs text-slate-300 leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br />') }} />
                          ) : (
                            <div className="space-y-3">
                              <p>Sua modelo está configurada com {activeProfile.persona.historia.length} caracteres de história e {activeProfile.persona.alma.length} caracteres de alma.</p>
                              <p className="text-slate-400">Clique no botão abaixo para analisar o contraste proibido da sua modelo virtual, obter ganchos específicos para o instagram dela, críticas de consistência física e sugestão de fetiches casuais compatíveis.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-850 space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Anotações extras para guiar a IA:</label>
                          <input
                            type="text"
                            placeholder="Ex: Quero focar em vender fetiche colegial e usar o Manychat comentando 'GAMES'"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs py-1.5 px-3 rounded-lg focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => askAICopilot("persona-suggestion", customPrompt)}
                          disabled={aiLoading}
                          className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-rose-800 disabled:to-pink-800 text-white font-extrabold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/20 transition active:scale-95 cursor-pointer"
                        >
                          {aiLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Processando Modelo de Linguagem...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                              <span>Solicitar Consultoria da IA</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GENERADOR DE PROMPTS DE FOTOS (ESTÚDIO DE IA EM LARGURA COMPLETA) */}
                  <div className="bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-rose-950/10 p-6 rounded-2xl border border-rose-950/10 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Image className="w-4 h-4 text-rose-400" />
                          <h4 className="text-sm font-bold text-slate-100">Estúdio de Geração Fotográfica por IA (Rostos e Corpo)</h4>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">Gere comandos em nível sênior em inglês para criar fotos realistas da modelo com consistência visual em ferramentas de IA (SeaArt, TensorArt, Fooocus).</p>
                      </div>
                      
                      <button
                        onClick={generateAIPromptsForModel}
                        disabled={promptsLoading}
                        className="bg-rose-900/20 hover:bg-rose-900/40 text-rose-400 font-extrabold text-xs px-4 py-2.5 rounded-lg border border-rose-900/30 transition flex items-center space-x-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                      >
                        {promptsLoading ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Gerando Prompts...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>✨ Criar Prompts do Zero</span>
                          </>
                        )}
                      </button>
                    </div>

                    {generatedPrompts ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-300 overflow-x-auto space-y-4 max-h-[450px] overflow-y-auto">
                          <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg text-xxs font-bold text-slate-400">
                            <span>PROMPTS GERADOS COM SUCESSO</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(generatedPrompts);
                              }}
                              className="text-rose-400 hover:text-rose-300 cursor-pointer flex items-center space-x-1"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Copiar Tudo</span>
                            </button>
                          </div>
                          
                          <div className="prose prose-invert prose-xs text-slate-300 font-sans leading-relaxed space-y-2 whitespace-pre-wrap">
                            {generatedPrompts}
                          </div>
                        </div>
                        
                        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="space-y-1">
                            <h5 className="text-xs font-bold text-slate-200">Como usar os Prompts para criar as fotos delas?</h5>
                            <p className="text-xxs text-slate-400 leading-relaxed">
                              1. Copie o prompt desejado acima e cole em um gerador gratuito como <strong>SeaArt.ai</strong>, <strong>TensorArt</strong> ou <strong>Civitai</strong>.<br />
                              2. Para manter 100% de consistência de rosto, selecione a imagem do primeiro avatar como imagem de referência de rosto em ferramentas de <strong>FaceSwap (Wefaceswap / RenderNet)</strong>.<br />
                              3. Use os prompts para construir uma linha cronológica realista: Stories amadores (sem make, de pijama) e Feed Instagram (passeio, compras, parque) antes de direcionar para o Telegram.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-slate-850">
                        <Image className="w-8 h-8 text-slate-600 mx-auto opacity-50 mb-2" />
                        <h5 className="text-xs font-bold text-slate-400">Sem prompts gerados para esta modelo</h5>
                        <p className="text-xxs text-slate-500 max-w-sm mx-auto mt-1">Preencha um pouco sobre os dados físicos e características da sua modelo acima ("Rosto Consistente", "Corpo") e depois clique em "Criar Prompts do Zero" para a IA criar os comandos matemáticos perfeitos de imagem.</p>
                      </div>
                    )}
                  </div>

                  {/* REFERÊNCIAS DE CONTEÚDO E SUBREDDITS FAVORITOS (nsfwdog.com) */}
                  <div className="bg-gradient-to-br from-slate-900/60 via-slate-950/40 to-pink-950/10 p-6 rounded-2xl border border-pink-950/15 space-y-5">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <Bookmark className="w-4 h-4 text-pink-400" />
                          <h4 className="text-sm font-bold text-slate-100">Referências de Conteúdo & Subreddits (nsfwdog.com)</h4>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold">
                          Acesse e salve páginas do Reddit para buscar poses, estilos de fotos, vídeos amadores e stories cotidianos reais para inspirar seu criativo ou guiar a IA.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
                        <button
                          onClick={handleSuggestSubredditsWithAI}
                          disabled={suggestingSubreddits}
                          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg transition flex items-center space-x-2 shadow-lg shadow-purple-950/30 cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>{suggestingSubreddits ? 'Buscando Canais...' : 'Pesquisa Automática por IA 🪄'}</span>
                        </button>

                        <a
                          href="https://nsfwdog.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg transition flex items-center space-x-2 shrink-0 shadow-lg shadow-pink-950/30 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir nsfwdog.com ↗</span>
                        </a>
                      </div>
                    </div>

                    {/* IA SUBREDDIT SUGGESTIONS PANEL */}
                    {showSuggestionsPanel && (
                      <div className="bg-slate-950/80 border border-purple-500/20 p-5 rounded-xl space-y-4 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold text-slate-200">Subreddits Recomendados por IA baseados na Persona</span>
                          </div>
                          <button
                            onClick={() => setShowSuggestionsPanel(false)}
                            className="text-slate-500 hover:text-slate-300 text-xxs font-extrabold uppercase tracking-widest cursor-pointer"
                          >
                            Fechar Sugestões ×
                          </button>
                        </div>

                        {suggestingSubreddits ? (
                          <div className="py-8 flex flex-col items-center justify-center space-y-2">
                            <RefreshCw className="w-6 h-6 text-purple-500 animate-spin" />
                            <p className="text-xxs text-slate-400 font-bold uppercase tracking-wider animate-pulse">
                              Analisando rosto, corpo, alma e história para selecionar melhores canais...
                            </p>
                          </div>
                        ) : (suggestedSubreddits === null || suggestedSubreddits.length === 0) ? (
                          <p className="text-xs text-slate-500 italic text-center py-4">Não foi possível gerar sugestões de subreddits baseados na persona.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                            {suggestedSubreddits.map((sug, idx) => {
                              const sugUrlCleaned = sug.url.replace('nsfwdog.com/r/', 'nsfwdog.com/sub/');
                              const alreadySaved = (activeProfile.savedRedditPages || []).some(
                                p => p.url.replace('nsfwdog.com/r/', 'nsfwdog.com/sub/') === sugUrlCleaned
                              );
                              return (
                                <div key={idx} className="bg-slate-900/50 hover:bg-slate-900 border border-purple-500/10 hover:border-purple-500/30 rounded-lg p-3 flex flex-col justify-between space-y-2 transition duration-150">
                                  <div className="space-y-1">
                                    <h5 className="text-xxs font-extrabold text-purple-300 truncate">{sug.label}</h5>
                                    <p className="text-[10px] text-slate-400 leading-normal italic line-clamp-3">
                                      "{sug.notes}"
                                    </p>
                                  </div>
                                  
                                  <div className="flex gap-2 pt-1 border-t border-slate-850/40">
                                    <a
                                      href={sugUrlCleaned}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 text-center bg-slate-950 hover:bg-slate-900 text-pink-400 hover:text-pink-300 font-bold text-[9px] py-1 rounded border border-pink-500/10 transition flex items-center justify-center space-x-1 cursor-pointer"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>Visualizar ↗</span>
                                    </a>

                                    <button
                                      onClick={() => handleSaveSuggestedPage({ ...sug, url: sugUrlCleaned })}
                                      disabled={alreadySaved}
                                      className={`px-2 py-1 rounded text-[9px] font-extrabold transition cursor-pointer flex items-center space-x-1 shrink-0 ${
                                        alreadySaved
                                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow shadow-purple-900'
                                      }`}
                                    >
                                      {alreadySaved ? 'Salvo' : 'Salvar'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Form to Save Page */}
                      <div className="lg:col-span-5 bg-slate-950/50 p-4 rounded-xl border border-slate-900 space-y-4">
                        <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest block">Salvar Nova Página Favorita</span>
                        
                        <div className="space-y-3.5">
                          <div>
                            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Subreddit ou Link da Página</label>
                            <input
                              type="text"
                              placeholder="Ex: r/Amateur, r/selfie ou link completo"
                              value={newRedditUrl}
                              onChange={(e) => setNewRedditUrl(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-650"
                            />
                            <p className="text-[9px] text-slate-500 mt-1 leading-tight font-semibold">
                              Se digitar apenas o nome (ex: "Amateur"), nós converteremos automaticamente para o link do nsfwdog.com.
                            </p>
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Título / Identificador</label>
                            <input
                              type="text"
                              placeholder="Ex: Ideias de Poses Caseiras"
                              value={newRedditLabel}
                              onChange={(e) => setNewRedditLabel(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-650"
                            />
                          </div>

                          <div>
                            <label className="text-xxs font-bold text-slate-400 uppercase tracking-wider block mb-1">Anotações Táticas (Opcional)</label>
                            <textarea
                              rows={2}
                              placeholder="Ex: Foco em poses no espelho de shorts ou pijama para story de bom dia."
                              value={newRedditNotes}
                              onChange={(e) => setNewRedditNotes(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs py-2 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-650 resize-none"
                            />
                          </div>

                          <button
                            onClick={handleSaveRedditPage}
                            className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs py-2.5 px-4 rounded-lg shadow-md transition active:scale-95 cursor-pointer"
                          >
                            Salvar nas Favoritas do Perfil
                          </button>
                        </div>
                      </div>

                      {/* List of Saved Favorites */}
                      <div className="lg:col-span-7 space-y-3.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-900">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Páginas Salvas para {activeProfile.name}</span>
                            <span className="text-[9px] text-slate-500 font-semibold bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded-full font-mono">
                              {(activeProfile.savedRedditPages || []).length} salvas
                            </span>
                          </div>

                          {(activeProfile.savedRedditPages || []).length > 0 && (
                            <button
                              onClick={handleAnalyzeFavoritesWithAI}
                              disabled={analyzingFavorites}
                              className="bg-slate-950 hover:bg-pink-900/20 text-pink-400 hover:text-pink-300 border border-pink-500/20 hover:border-pink-500/40 font-extrabold text-xxs px-3 py-1.5 rounded-lg transition flex items-center space-x-1.5 shadow shadow-pink-950/20 cursor-pointer disabled:opacity-50"
                            >
                              <Sparkles className="w-3 h-3 animate-pulse" />
                              <span>{analyzingFavorites ? 'Analisando...' : 'Analisar Favoritos com IA 🔮'}</span>
                            </button>
                          )}
                        </div>

                        {/* ANALYSIS LOADING / RESULT BOX */}
                        {analyzingFavorites && (
                          <div className="bg-slate-950/40 border border-pink-500/5 rounded-xl p-6 flex flex-col items-center justify-center space-y-3">
                            <RefreshCw className="w-5 h-5 text-pink-500 animate-spin" />
                            <p className="text-xxs text-pink-400 font-bold uppercase tracking-wider animate-pulse text-center">
                              IA extraindo visual hooks, rotinas de stories e ganchos dos seus favoritos...
                            </p>
                          </div>
                        )}

                        {favoritesAnalysisResult && (
                          <div className="bg-gradient-to-r from-pink-950/30 via-slate-950 to-pink-950/20 border border-pink-500/10 rounded-xl p-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-905 pb-2">
                              <div className="flex items-center space-x-2">
                                <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                                <span className="text-xs font-bold text-pink-300">Análise Tática dos Canais Favoritos</span>
                              </div>
                              <button
                                onClick={() => setFavoritesAnalysisResult(null)}
                                className="text-slate-500 hover:text-slate-300 text-xxs font-extrabold uppercase tracking-widest cursor-pointer"
                              >
                                Ocultar Análise ×
                              </button>
                            </div>

                            <div 
                              className="text-slate-300 text-xs leading-relaxed space-y-3 selection:bg-pink-500/30"
                              dangerouslySetInnerHTML={{ 
                                __html: favoritesAnalysisResult
                                  .replace(/\n\n/g, '<div class="h-2"></div>')
                                  .replace(/\n/g, '<br />')
                              }} 
                            />
                          </div>
                        )}

                        {(!activeProfile.savedRedditPages || activeProfile.savedRedditPages.length === 0) ? (
                          <div className="text-center py-12 bg-slate-950/20 rounded-xl border border-dashed border-slate-850 flex flex-col items-center justify-center space-y-2">
                            <Bookmark className="w-8 h-8 text-slate-600 opacity-40" />
                            <h5 className="text-xs font-bold text-slate-400">Nenhuma página favorita salva ainda</h5>
                            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                              Adicione subreddits ou links ao lado para ter um atalho rápido de referências sempre disponível neste perfil de modelo.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                             {activeProfile.savedRedditPages.map((page) => {
                              const healedUrl = page.url.replace('nsfwdog.com/r/', 'nsfwdog.com/sub/');
                              return (
                                <div
                                  key={page.id}
                                  className="bg-slate-900/40 hover:bg-slate-900 border border-slate-850 hover:border-pink-500/20 rounded-xl p-3.5 flex flex-col justify-between space-y-2 transition duration-150"
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <h5 className="text-xs font-bold text-slate-100 line-clamp-1">{page.label}</h5>
                                      <button
                                        onClick={() => handleDeleteRedditPage(page.id)}
                                        className="text-slate-500 hover:text-rose-400 transition p-0.5"
                                        title="Remover dos favoritos"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    
                                    {page.notes && (
                                      <p className="text-[10px] text-slate-400 leading-normal italic line-clamp-2">
                                        "{page.notes}"
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center space-x-1.5 pt-0.5">
                                      <Link className="w-2.5 h-2.5 text-pink-400 shrink-0" />
                                      <span className="text-[9px] font-mono text-slate-500 truncate block max-w-[150px]" title={healedUrl}>
                                        {healedUrl.replace('https://', '').replace('http://', '')}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 pt-1 border-t border-slate-850/40">
                                    <a
                                      href={healedUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 text-center bg-slate-950 hover:bg-slate-900 text-pink-400 hover:text-pink-300 font-extrabold text-[10px] py-1.5 rounded border border-pink-500/10 hover:border-pink-500/25 transition flex items-center justify-center space-x-1 cursor-pointer"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>Acessar Canal ↗</span>
                                    </a>
                                    
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(healedUrl);
                                        alert('Link copiado!');
                                      }}
                                      className="p-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white rounded border border-slate-800 transition"
                                      title="Copiar URL completa"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================
                  SUBT-TAB B: STEP-BY-STEP FUNNEL WIZARD (8 STEPS)
                 ==================================================== */}
              {workspaceSubTab === 'wizard' && (
                <div className="space-y-6">
                  <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">Guia de Engenharia Recomendado</h3>
                      <p className="text-xs text-slate-400 mt-1">Conclua as sub-tarefas de cada uma das 8 fases do funil com base nos testes do mercado de Conversão Hot.</p>
                    </div>
                    <div className="text-xs text-slate-300 bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                      Fase Atual Ativa: <strong className="text-rose-500">
                        {Math.min(8, Math.max(1, activeProfile.funnelSteps.findIndex(s => s.status !== 'Concluído' && s.status !== 'Validado') + 1))} de 8
                      </strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    
                    {/* LEFT LIST: STAGES NAVIGATION */}
                    <div className="lg:col-span-1 space-y-2">
                      {activeProfile.funnelSteps.map((step) => {
                        const totalTasks = STEP_CHECKLISTS[step.stepId]?.length || 0;
                        const doneTasks = Array.isArray(step.completedTasks) ? step.completedTasks.length : 0;
                        return (
                          <button
                            key={step.stepId}
                            onClick={() => {
                              setSelectedStageId(step.stepId);
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition ${
                              selectedStageId === step.stepId 
                                ? 'bg-gradient-to-r from-rose-950/20 to-slate-950 border-rose-500/60' 
                                : 'bg-slate-900/30 border-slate-850 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <span className="text-xxs font-extrabold text-slate-500 uppercase tracking-widest block">Passo {step.stepId}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                step.status === 'Validado' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                step.status === 'Concluído' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                                step.status === 'Em andamento' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-slate-950 text-slate-500'
                              }`}>
                                {step.status}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-200 mt-1 line-clamp-1 group-hover:text-white">{step.title}</h4>
                            
                            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Checklist: <strong>{doneTasks} de {totalTasks}</strong></span>
                              <span>{Math.round((doneTasks / Math.max(1, totalTasks)) * 100)}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* RIGHT DETAILED FORM FOR SELECTED STAGE */}
                    <div className="lg:col-span-3 space-y-6">
                      {(() => {
                        const activeStage = activeProfile.funnelSteps.find(s => s.stepId === selectedStageId);
                        if (!activeStage) return null;
                        const tasks = STEP_CHECKLISTS[activeStage.stepId] || [];

                        return (
                          <div className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                            
                            {/* TITLE HEADER */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-850">
                              <div>
                                <span className="text-xs text-rose-400 font-bold tracking-wider block uppercase">Passo {activeStage.stepId} do HotFunnel</span>
                                <h3 className="text-lg font-bold text-white mt-1">{activeStage.title}</h3>
                                <p className="text-xs text-slate-400">{activeStage.description}</p>
                              </div>

                              <div className="flex items-center space-x-2">
                                <label className="text-[11px] font-bold text-slate-400">Status:</label>
                                <select
                                  value={activeStage.status}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value as any;
                                    const nextSteps = activeProfile.funnelSteps.map(s => s.stepId === activeStage.stepId ? { ...s, status: nextStatus } : s);
                                    updateProfileData({ ...activeProfile, funnelSteps: nextSteps }, `Alterou status do Passo ${activeStage.stepId} para: ${nextStatus}`);
                                  }}
                                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg py-1 px-2.5 text-slate-300"
                                >
                                  <option value="Não iniciado">Não iniciado</option>
                                  <option value="Em andamento">Em andamento</option>
                                  <option value="Concluído">Concluído</option>
                                  <option value="Validado">Validado</option>
                                </select>
                              </div>
                            </div>

                            {/* PLAYBOOK CHECKLIST */}
                            <div className="space-y-3.5">
                              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">Playbook: Checklist de Operações</h4>
                                <span className="text-[10px] text-slate-500 font-semibold font-mono">Clique no texto para marcar, ou no botão para obter ajuda de IA</span>
                              </div>
                              <div className="space-y-2">
                                {tasks.map((taskText, idx) => {
                                  const completedArr = Array.isArray(activeStage.completedTasks) ? activeStage.completedTasks : [];
                                  const isChecked = completedArr.includes(taskText);
                                  return (
                                    <div
                                      key={idx}
                                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border gap-3 transition ${
                                        isChecked 
                                          ? 'bg-slate-900/60 border-rose-500/20 text-slate-300' 
                                          : 'bg-slate-950 border-slate-1000 text-slate-400 hover:border-slate-800/80'
                                      }`}
                                    >
                                      <div 
                                        onClick={() => {
                                          let updatedCompleted = Array.isArray(activeStage.completedTasks) ? [...activeStage.completedTasks] : [];
                                          if (isChecked) {
                                            updatedCompleted = updatedCompleted.filter(t => t !== taskText);
                                          } else {
                                            if (!updatedCompleted.includes(taskText)) {
                                              updatedCompleted.push(taskText);
                                            }
                                          }
                                          const nextSteps = activeProfile.funnelSteps.map(s => s.stepId === activeStage.stepId ? { ...s, completedTasks: updatedCompleted } : s);
                                          updateProfileData({ ...activeProfile, funnelSteps: nextSteps }, `${isChecked ? 'Marcou pendente' : 'Concluiu tarefa'} no Passo ${activeStage.stepId}: "${taskText.substring(0, 50)}..."`);
                                        }}
                                        className="flex items-start space-x-3 cursor-pointer flex-1"
                                      >
                                        <div className="mt-0.5 shrink-0">
                                          {isChecked ? (
                                            <CheckSquare className="w-4 h-4 text-rose-500" />
                                          ) : (
                                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                                          )}
                                        </div>
                                        <span className="text-xs leading-relaxed font-semibold select-none">{taskText}</span>
                                      </div>

                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          getTaskGuidanceFromAI(activeStage.stepId, activeStage.title, taskText);
                                        }}
                                        className="shrink-0 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-extrabold text-[10px] rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                                      >
                                        <Sparkles className="w-3 h-3 text-pink-400 group-hover:text-white" />
                                        <span>Como Fazer com IA?</span>
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* WORK EVIDENCE AND NOTES FOOTERS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Evidências / O que já foi feito:</label>
                                <textarea
                                  placeholder="Digite links das fotos, mídias ou automações implementadas..."
                                  value={activeStage.evidence}
                                  onChange={(e) => {
                                    const nextSteps = activeProfile.funnelSteps.map(s => s.stepId === activeStage.stepId ? { ...s, evidence: e.target.value } : s);
                                    updateProfileData({ ...activeProfile, funnelSteps: nextSteps });
                                  }}
                                  rows={3}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-2 focus:outline-none focus:border-rose-500 text-slate-300"
                                />
                              </div>

                              <div>
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pontos observados de Melhoria:</label>
                                <textarea
                                  placeholder="Ex: manychat apresentou falha na entrega automática do link..."
                                  value={activeStage.improvements}
                                  onChange={(e) => {
                                    const nextSteps = activeProfile.funnelSteps.map(s => s.stepId === activeStage.stepId ? { ...s, improvements: e.target.value } : s);
                                    updateProfileData({ ...activeProfile, funnelSteps: nextSteps });
                                  }}
                                  rows={3}
                                  className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-2 focus:outline-none focus:border-rose-500 text-slate-300"
                                />
                              </div>
                            </div>

                            {/* STEP COPILOT ADVICE */}
                            <div className="bg-slate-950 p-4 rounded-xl border border-rose-950/20 space-y-3">
                              <div className="flex items-center justify-between border-b border-rose-950/20 pb-2.5">
                                <div className="flex items-center space-x-2">
                                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                                  <span className="text-xs font-bold text-slate-200">Recomendação do Copiloto Sênior para este Passo</span>
                                </div>
                                <button
                                  onClick={() => getStageAdviceFromAI(activeStage.stepId)}
                                  disabled={stepAiLoading[activeStage.stepId]}
                                  className="bg-rose-950/50 hover:bg-rose-900/40 text-rose-300 text-[10px] font-extrabold px-3 py-1 rounded-md border border-rose-900 transition flex items-center space-x-1"
                                >
                                  {stepAiLoading[activeStage.stepId] ? (
                                    <>
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                      <span>Carregando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <RefreshCw className="w-3 h-3" />
                                      <span>Solicitar Diagnóstico</span>
                                    </>
                                  )}
                                </button>
                              </div>

                              <div className="text-xs text-slate-300 leading-relaxed max-h-[220px] overflow-y-auto pr-2 space-y-2">
                                {activeStage.aiAdvice ? (
                                  <div className="prose prose-invert prose-xs text-slate-300" dangerouslySetInnerHTML={{ __html: activeStage.aiAdvice.replace(/\n/g, '<br />') }} />
                                ) : (
                                  <p className="text-slate-400 italic">Clique no botão acima para coletar o checklist tático, copy de checkout, e estruturação de pixel específicas para esta fase do funil da sua modelo.</p>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              )}

              {/* ====================================================
                  SUBT-TAB C: CUSTOMIZÁVEL ESTEIRA OFERTAS (PRODUCTS)
                 ==================================================== */}
              {workspaceSubTab === 'products' && (
                <div className="space-y-6">
                  
                  {/* STRATEGY HEADER CARD */}
                  <div className="bg-gradient-to-r from-amber-950/20 to-slate-950 p-5 rounded-2xl border border-amber-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center space-x-1">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <h4 className="text-sm font-bold text-slate-100">Estrutura de Micro-Ticket Sem Atrito</h4>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        O funil clássico do nicho hot exige um <strong>Front-end baixo (R$ 9,90)</strong> para vencer a barreira da timidez de compra do homem. Logo após o checkout, o sistema deve sugerir sequencialmente Orderbump (+R$ 4,90 Close Friends) e Upsells maiores de mentira (ex: R$ 19,90 fetiche / R$ 49,90 whatsapp privado).
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                      <button
                        onClick={handleGenerateAiProductSuite}
                        disabled={productSuiteLoading}
                        className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-slate-800 disabled:to-slate-800 text-white font-extrabold text-xxs px-4 py-2.5 rounded-lg shadow-lg shadow-rose-950/20 transition flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
                      >
                        {productSuiteLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Gerando Esteira...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
                            <span>Gerar Esteira com IA</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          updateProfileData({
                            ...activeProfile,
                            products: [...INITIAL_PRODUCTS_TEMPLATES]
                          }, "Carregou os templates padronizados de alta conversão de mídias.");
                        }}
                        className="bg-slate-900/60 border border-slate-800 hover:bg-slate-900 text-slate-300 font-extrabold text-xxs px-4 py-2.5 rounded-lg transition text-center hover:text-white"
                      >
                        Restaurar Valores Padrão
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* EDIT LIST - PRODUCTS */}
                    <div className="lg:col-span-2 bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                        <h3 className="font-bold text-sm text-slate-200">Produtos da Modelo</h3>
                        <p className="text-xs text-slate-500 font-semibold">{(activeProfile.products || []).length} ofertas registradas</p>
                      </div>

                      <div className="space-y-3">
                        {(activeProfile.products || []).map((product, idx) => (
                          <div key={product.id} className="bg-slate-950 border border-slate-900/80 p-3 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              
                              {/* Header row details */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase ${
                                  product.type === 'Front' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                  product.type === 'Orderbump' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                  product.type === 'Upsell' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                                  'bg-slate-800 text-slate-400'
                                }`}>
                                  {product.type}
                                </span>
                                
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => {
                                    const nextProds = [...(activeProfile.products || [])];
                                    nextProds[idx] = { ...nextProds[idx], name: e.target.value };
                                    updateProfileData({ ...activeProfile, products: nextProds });
                                  }}
                                  className="bg-transparent text-slate-200 font-bold text-xs border-b border-transparent hover:border-slate-800 focus:border-rose-500 focus:outline-none w-full sm:w-60 px-1 py-0.5"
                                />
                              </div>

                              <input
                                type="text"
                                placeholder="Descrição da entrega para o comprador..."
                                value={product.description}
                                onChange={(e) => {
                                  const nextProds = [...(activeProfile.products || [])];
                                  nextProds[idx] = { ...nextProds[idx], description: e.target.value };
                                  updateProfileData({ ...activeProfile, products: nextProds });
                                }}
                                className="w-full bg-transparent text-slate-400 text-xxs border-b border-transparent hover:border-slate-850 px-1 py-0.5"
                              />
                            </div>

                            {/* Controls and Price */}
                            <div className="flex items-center space-x-3 whitespace-nowrap">
                              <div className="flex items-center bg-slate-900/60 px-2 py-1 rounded border border-slate-800 text-xs font-bold text-slate-300">
                                <span className="text-xxs text-slate-500 mr-1">R$</span>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={product.price}
                                  onChange={(e) => {
                                    const nextProds = [...(activeProfile.products || [])];
                                    nextProds[idx] = { ...nextProds[idx], price: parseFloat(e.target.value) || 0 };
                                    updateProfileData({ ...activeProfile, products: nextProds });
                                  }}
                                  className="bg-transparent font-extrabold w-12 text-slate-200 text-right focus:outline-none"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  const nextProds = (activeProfile.products || []).filter(p => p.id !== product.id);
                                  updateProfileData({ ...activeProfile, products: nextProds }, `Deletou produto da esteira: ${product.name}`);
                                }}
                                className="text-slate-600 hover:text-rose-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => {
                            const newProd: Product = {
                              id: `prod-addon-${Date.now()}`,
                              type: 'Upsell',
                              name: 'Novidade Secreta (Fetiche)',
                              price: 19.90,
                              description: 'Descrição de como o lead acessa a mídia.',
                              isActive: true
                            };
                            updateProfileData({
                              ...activeProfile,
                              products: [...(activeProfile.products || []), newProd]
                            }, "Adicionou novo Upsell à esteira.");
                          }}
                          className="w-full py-2.5 border border-dashed border-slate-800 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 bg-slate-900/10"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Nova Oferta</span>
                        </button>
                      </div>
                    </div>

                    {/* PIXEL CODE GENERATED ADVICE */}
                    <div className="lg:col-span-1 bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                      <div className="border-b border-slate-850 pb-2.5">
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Checkout Otimizado</span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">Sugerido para Disparar Pixel</h4>
                      </div>

                      <div className="space-y-4 text-xs">
                        <p className="text-slate-400 leading-relaxed">
                          Garanta que os eventos abaixo estejam trackeados na Hubla, Kiwify ou PerfectPay para otimização da Inteligência do Meta Ads:
                        </p>

                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 space-y-2 text-xxs font-mono">
                          <div className="flex justify-between text-slate-300">
                            <span>Page_View</span>
                            <span className="text-slate-500">- Tela de Vendas</span>
                          </div>
                          <div className="flex justify-between text-amber-400">
                            <span>Initiate_Checkout</span>
                            <span className="text-slate-600">- Form preenchido</span>
                          </div>
                          <div className="flex justify-between text-rose-400">
                            <span>Purchase (Front: 9,90)</span>
                            <span className="text-slate-600">- Convertido</span>
                          </div>
                          <div className="flex justify-between text-pink-400">
                            <span>Orderbump_Add</span>
                            <span className="text-slate-600">- Incremento</span>
                          </div>
                        </div>

                        <div className="p-3 bg-rose-950/20 border border-rose-900/20 rounded-lg">
                          <span className="text-[10px] text-rose-300 font-bold block mb-1">Dica de LTV</span>
                          <p className="text-xxs text-slate-400 leading-relaxed">
                            Clientes que compram o Front de R$ 9,90 de forma impulsiva apresentam 44% de chance de comprar um fetiche de R$ 19,90 em até 2 horas se acionados por áudio direto no privado.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ====================================================
                  SUBT-TAB D: METRICAS E CONTROLE ADS CAMPAIGNS
                 ==================================================== */}
              {workspaceSubTab === 'ads' && (
                <div className="space-y-6">
                  
                  {/* ADS DIAGNOSTIC INSIGHT */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">CTR Ideal do Topo de Funil</span>
                      <p className="text-lg font-bold text-slate-200 mt-1">62% ~ 81%</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Taxa de cliques que sai do Instagram/TikTok e entra de fato no Canal do Telegram Gratuito.</p>
                    </div>

                    <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">CTR Ideal de Venda do VIP</span>
                      <p className="text-lg font-bold text-rose-400 mt-1">18% ~ 29%</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Cliques no botão de checkout do robô dentro do canal VIP/Canal Aberto.</p>
                    </div>

                    <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold">Fórmula de Escala Vert.</span>
                      <p className="text-lg font-bold text-amber-400 mt-1">ROI &gt; 2.5</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">Aumentar orçamento em no máximo 30% a cada 48 horas para não quebrar a amostragem.</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-rose-400" />
                        <h3 className="font-bold text-sm text-slate-200">Gerenciador Simulado de Campanhas Meta Ads</h3>
                      </div>
                      
                      <button
                        onClick={() => {
                          const newCamp: Campaign = {
                            id: `camp-${Date.now()}`,
                            name: `[ABO] ${activeProfile.name} - Teste Criativos Amadores`,
                            type: 'ABO',
                            budget: 35.00,
                            structure: '1-3-1',
                            leadCtr: 6.5,
                            saleCtr: 1.5,
                            roi: 2.0,
                            note: 'Selfie estilo tímida correndo no parque.',
                            status: 'Ativo'
                          };
                          updateProfileData({
                            ...activeProfile,
                            campaigns: [...(activeProfile.campaigns || []), newCamp]
                          }, `Registrou nova campanha de Ads: ${newCamp.name}`);
                        }}
                        className="bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-300 px-3 py-1.5 rounded-lg text-xxs font-extrabold transition flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Nova Campanha</span>
                      </button>
                    </div>

                    {/* CAMPAIGN LIST */}
                    {(!activeProfile.campaigns || activeProfile.campaigns.length === 0) ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center">Nenhuma campanha de Meta Ads vinculada a esta modelo. Clique em registrar para simular.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-850 text-slate-400 uppercase tracking-widest text-[9px] font-bold">
                              <th className="py-2">Campanha</th>
                              <th className="py-2">Orçamento</th>
                              <th className="py-2">Estrutura</th>
                              <th className="py-2">CTR Lead (%)</th>
                              <th className="py-2">CTR Venda (%)</th>
                              <th className="py-2">ROI</th>
                              <th className="py-2">Status</th>
                              <th className="py-2 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeProfile.campaigns.map((camp, idx) => (
                              <tr key={camp.id} className="border-b border-slate-850/40 text-slate-300 hover:bg-slate-900/10">
                                <td className="py-3 pr-2">
                                  <input
                                    type="text"
                                    value={camp.name}
                                    onChange={(e) => {
                                      const nextC = [...(activeProfile.campaigns || [])];
                                      nextC[idx] = { ...nextC[idx], name: e.target.value };
                                      updateProfileData({ ...activeProfile, campaigns: nextC });
                                    }}
                                    className="bg-transparent border-b border-transparent focus:border-rose-500 font-bold focus:outline-none focus:text-white px-1 py-0.5 w-[200px]"
                                  />
                                </td>
                                <td className="py-3 font-semibold text-slate-300">
                                  R${camp.budget.toFixed(0)}/dia
                                </td>
                                <td className="py-3 text-slate-400">
                                  {camp.structure}
                                </td>
                                <td className="py-3 text-slate-400">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={camp.leadCtr}
                                    onChange={(e) => {
                                      const nextC = [...(activeProfile.campaigns || [])];
                                      nextC[idx] = { ...nextC[idx], leadCtr: parseFloat(e.target.value) || 0 };
                                      updateProfileData({ ...activeProfile, campaigns: nextC });
                                    }}
                                    className="bg-transparent border border-slate-800 w-12 rounded px-1.5 focus:outline-none focus:border-rose-500 text-center"
                                  />
                                </td>
                                <td className="py-3 text-slate-400">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={camp.saleCtr}
                                    onChange={(e) => {
                                      const nextC = [...(activeProfile.campaigns || [])];
                                      nextC[idx] = { ...nextC[idx], saleCtr: parseFloat(e.target.value) || 0 };
                                      updateProfileData({ ...activeProfile, campaigns: nextC });
                                    }}
                                    className="bg-transparent border border-slate-800 w-12 rounded px-1.5 focus:outline-none focus:border-rose-500 text-center"
                                  />
                                </td>
                                <td className="py-3 font-extrabold text-amber-400">
                                  {camp.roi}x
                                </td>
                                <td className="py-3">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    camp.status === 'Escalado' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    camp.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    'bg-slate-900 text-slate-500'
                                  }`}>
                                    {camp.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <button
                                    onClick={() => {
                                      const nextC = (activeProfile.campaigns || []).filter(c => c.id !== camp.id);
                                      updateProfileData({ ...activeProfile, campaigns: nextC }, `Deletou registro de campanha: ${camp.name}`);
                                    }}
                                    className="text-slate-600 hover:text-rose-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ====================================================
                  SUBT-TAB E: CALENDARIO DE PUBLICACAO E SUGERIDOR
                 ==================================================== */}
              {workspaceSubTab === 'calendar' && (
                <div className="space-y-6">
                  
                  {/* GENERATOR EXTRAS TRIGGER */}
                  <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start space-x-1">
                        <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                        <h4 className="text-sm font-bold text-slate-200">Gerar Legendas e Ganchos de Reels com IA</h4>
                      </div>
                      <p className="text-xs text-slate-500">O copiloto gera na hora copies realistas da persona baseadas na sua história emocional de nutrição, games ou dona de casa.</p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('generator');
                        askAICopilot("content-ideas", `Ideas para postagens diárias de: ${activeProfile.name}, com fetiches de front e cta Manychat`);
                      }}
                      className="bg-gradient-to-r from-rose-600 to-pink-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg hover:from-rose-500 hover:to-pink-500 transition shadow-lg shadow-rose-950/20"
                    >
                      Criar Roteiros pelo Estúdio de IA
                    </button>
                  </div>

                  {/* ACTIVE POST CALENDAR LIST */}
                  <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h3 className="font-bold text-sm text-slate-200">Planner de Publicação</h3>
                      
                      <button
                        onClick={() => {
                          const newItem: CalendarItem = {
                            id: `cal-addon-${Date.now()}`,
                            platform: 'Instagram',
                            type: 'Stories',
                            hook: 'Rotina Amadora',
                            desc: 'Descreva a foto caseira do dia e o gancho para Direct Manychat.',
                            published: false,
                            date: new Date().toISOString().split('T')[0]
                          };
                          updateProfileData({
                            ...activeProfile,
                            calendar: [...activeProfile.calendar, newItem]
                          }, "Adicionou postagem no calendário de conteúdo.");
                        }}
                        className="bg-slate-950 border border-slate-850 text-slate-300 text-xxs font-extrabold px-3 py-1.5 rounded-lg transition"
                      >
                        Agendar Nova Postagem
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeProfile.calendar.map((item, idx) => (
                        <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-900/80 flex flex-col justify-between space-y-3 relative">
                          
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                              item.platform === 'Instagram' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                              item.platform === 'Telegram' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                              'bg-slate-900 text-slate-400'
                            }`}>
                              {item.platform} • {item.type}
                            </span>

                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => {
                                const nextCal = [...activeProfile.calendar];
                                nextCal[idx].date = e.target.value;
                                updateProfileData({ ...activeProfile, calendar: nextCal });
                              }}
                              className="bg-transparent border border-slate-850 text-xxs text-slate-400 rounded px-1.5 focus:outline-none focus:border-rose-500 text-center"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={item.hook}
                              onChange={(e) => {
                                const nextCal = [...activeProfile.calendar];
                                nextCal[idx].hook = e.target.value;
                                updateProfileData({ ...activeProfile, calendar: nextCal });
                              }}
                              placeholder="Gancho da publicação..."
                              className="w-full bg-transparent text-slate-200 font-bold text-xs border-b border-transparent focus:border-rose-500 focus:outline-none"
                            />
                            
                            <textarea
                              value={item.desc}
                              onChange={(e) => {
                                const nextCal = [...activeProfile.calendar];
                                nextCal[idx].desc = e.target.value;
                                updateProfileData({ ...activeProfile, calendar: nextCal });
                              }}
                              rows={2.5}
                              placeholder="Descreva a legenda ou o roteiro..."
                              className="w-full bg-transparent text-slate-400 text-xxs border-b border-transparent focus:border-rose-500 focus:outline-none resize-none"
                            />
                          </div>

                          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                            <button
                              onClick={() => {
                                const nextCal = [...activeProfile.calendar];
                                nextCal[idx].published = !nextCal[idx].published;
                                updateProfileData({ ...activeProfile, calendar: nextCal }, `${nextCal[idx].published ? 'Marcar como Publicado' : 'Desmarcar publicação'}: "${item.hook}"`);
                              }}
                              className={`text-[10px] font-bold flex items-center space-x-1 transition ${
                                item.published ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{item.published ? 'Publicado' : 'Marcar Publicado'}</span>
                            </button>

                            <button
                              onClick={() => {
                                const nextCal = activeProfile.calendar.filter(c => c.id !== item.id);
                                updateProfileData({ ...activeProfile, calendar: nextCal }, `Deletou postagem agendada: ${item.hook}`);
                              }}
                              className="text-slate-600 hover:text-rose-500 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ====================================================
                  SUBT-TAB F: COMPILADO DE LOGS (LOGS & NOTES)
                 ==================================================== */}
              {workspaceSubTab === 'logs' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* EDIT NOTES SECTION */}
                  <div className="md:col-span-1 bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-slate-200">Anotações da Modelo</h4>
                      <p className="text-[10px] text-slate-500 italic">Bloco livre</p>
                    </div>

                    <textarea
                      value={activeProfile.notes}
                      onChange={(e) => {
                        updateProfileData({ ...activeProfile, notes: e.target.value });
                      }}
                      rows={14}
                      placeholder="Anote links extras, contas de fakes ou novas ideias que ainda não estruturou..."
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-3 focus:outline-none focus:border-rose-500 text-slate-300"
                    />
                  </div>

                  {/* ACTION LOGS TRACKER */}
                  <div className="md:col-span-2 bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-slate-200">Registro Automático de Ações</h4>
                      <button
                        onClick={() => {
                          updateProfileData({ ...activeProfile, logs: [] });
                        }}
                        className="text-xxs text-slate-500 hover:text-rose-400 transition"
                      >
                        Limpar log
                      </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                      {activeProfile.logs.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-6 text-center">Nenhuma ação registrada nesta modelo ainda.</p>
                      ) : (
                        activeProfile.logs.map((log) => (
                          <div key={log.id} className="bg-slate-950 border border-slate-900/80 p-2.5 rounded-lg flex items-start space-x-3 text-xxs">
                            <span className="text-slate-500 font-mono whitespace-nowrap">{log.timestamp}</span>
                            <span className="text-slate-300 font-semibold leading-relaxed">{log.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ==========================================
              TAB 3: STUDIO DE GENERACAO (ESTÚDIO DE IA)
             ========================================== */}
          {activeTab === 'generator' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-850/60 space-y-4 text-center md:text-left backdrop-blur-md">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/15 px-2 py-0.5 rounded-full uppercase tracking-widest inline-block">MÓDULO DE INTELIGÊNCIA</span>
                    <h2 className="text-xl font-extrabold text-white">Estúdio IA: Copiloto Sênior Hot</h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      Gerador de alta conversão tática para o nicho Hot. Dite o que você precisa ou utilize os botões rápidos de pré-ajuste abaixo. Suas sugestões estarão sempre calibradas no tom perfeito do público masculino nacional.
                    </p>
                  </div>
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20 hidden md:block">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* GUIA DE INICIAÇÃO RÁPIDA - EXTREMELY HELPFUL FOR BEGINNERS */}
              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-rose-400" />
                  <span>Guia do Iniciante: O que Desenvolver Aqui?</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="text-rose-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                      1. STORIES DIÁRIOS
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Peça roteiros de stories simples simulando rotina real (café, treino, estudos) para gerar conexão espontânea.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="text-pink-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                      2. ANÚNCIOS (ADS)
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Crie copas de selfies sutis que capturam cliques baratos ocultando o nicho para evitar bloqueios no Facebook.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="text-amber-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      3. SCRIPTS DE ÁUDIO
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Gere copias de áudios que parecem gravados no improviso para disparar em automações de funil (ManyChat/Telegram).
                    </p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-2">
                    <div className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      4. CONVERSÃO DE CHAT
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Responda leads curiosos ou pão-duros que estão no canal gratuito mas ainda hesitam em assinar o VIP mensal.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SELECT CHOKE PRESET */}
                <button
                  onClick={() => {
                    const prompt = activeProfile ? `Ideas para Reels e Tik Tok da modelo ${activeProfile.name}. Foco em mistério e direcionando Manychat.` : "Ideias de conteúdo de alta viralidade no instagram";
                    askAICopilot("content-ideas", prompt);
                  }}
                  className="bg-slate-900/40 hover:bg-slate-900/70 text-left p-4 rounded-xl border border-slate-850 hover:border-pink-500/40 transition flex items-start space-x-3 group"
                >
                  <Calendar className="w-5 h-5 text-pink-400 mt-0.5 group-hover:scale-110 transition" />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-pink-400 transition">Gerador de Roteiros &amp; Stories</h4>
                    <p className="text-xxs text-slate-400 mt-1 leading-relaxed">Copies realistas e histórias de ganchos virais que convertem visualização em mimos e directs.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const prompt = activeProfile ? `Sugira melhorias detalhadas na definição de persona para a modelo ${activeProfile.name}, como lidar com fotos consistentes e fetiche principal.` : "Como estruturar uma modelo do absoluto zero mantendo persistência de imagens";
                    askAICopilot("persona-suggestion", prompt);
                  }}
                  className="bg-slate-900/40 hover:bg-slate-900/70 text-left p-4 rounded-xl border border-slate-850 hover:border-rose-500/40 transition flex items-start space-x-3 group"
                >
                  <Award className="w-5 h-5 text-rose-400 mt-0.5 group-hover:scale-110 transition" />
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-200 group-hover:text-rose-400 transition">Estruturar Persona Proibida</h4>
                    <p className="text-xxs text-slate-400 mt-1 leading-relaxed">Refine o backstory emocional perfeito e ative o segredo do contraste proibido para o público masculino.</p>
                  </div>
                </button>
              </div>

              {/* INPUT CUSTOM CHAT */}
              <div className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">O que você deseja que o Co-piloto Estruture?</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Crie 3 áudios de scripts para o Manychat simulando que eu acabei de acordar e estou empolgada com a prévia do Telegram."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg text-xs p-3 text-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => askAICopilot("custom-generator", customPrompt)}
                    disabled={aiLoading || !customPrompt}
                    className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 disabled:from-rose-800 disabled:to-pink-800 text-white font-extrabold text-xs px-6 py-2.5 rounded-lg shadow-lg shadow-rose-950/20 transition flex items-center space-x-1.5"
                  >
                    {aiLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Carregando do OpenAI/Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Processar com Inteligência</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* OUTPUT CONTAINER RESPONSE */}
              <div className="bg-slate-900/30 p-6 rounded-2xl border border-slate-850 space-y-3 min-h-[160px]">
                <div className="flex items-center space-x-2 border-b border-slate-850 pb-2">
                  <Info className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-300">Resposta do Copiloto</span>
                </div>
                
                <div className="text-xs text-slate-300 leading-relaxed space-y-2 select-text">
                  {aiLoading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-3">
                      <RefreshCw className="w-7 h-7 text-rose-500 animate-spin" />
                      <span className="text-slate-400 font-semibold text-xxs tracking-wider uppercase animate-pulse">Acessando central de mapas ocultos...</span>
                    </div>
                  ) : aiResponse ? (
                    <div className="prose prose-invert prose-xs text-slate-300" dangerouslySetInnerHTML={{ __html: aiResponse.replace(/\n/g, '<br />') }} />
                  ) : (
                    <p className="text-slate-500 italic py-6 text-center">Nenhuma resposta gerada ainda nesta sessão. Escolha um gerador acima ou digite uma solicitação customizada.</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: MANUAL DE CONHECIMENTO (LIBRARY)
             ========================================== */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              {/* DESCRIPTION & SEARCH */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Manual Hot de Alta Conversão Oculto</h2>
                  <p className="text-xs text-slate-400 mt-1">Busque rapidamente conceitos do mapa de contingências, meta ads, funis, pixels e estruturas ABO/CBO ensinadas por profissionais.</p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Buscar no manual... (ex: ABO, link, ManyChat, pixel)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* ACCORDION/LIST OF MAP ITEMS */}
              <div className="space-y-4">
                {filteredKnowledge.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/30 p-5 rounded-2xl border border-slate-850 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm text-slate-200">{item.title}</h3>
                      <span className="text-[10px] bg-rose-600/10 text-rose-400 font-bold px-2 py-0.5 rounded border border-rose-500/20">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
                  </div>
                ))}

                {filteredKnowledge.length === 0 && (
                  <p className="text-xs text-slate-500 italic text-center py-10">Nenhum ensinamento coincide com sua busca.</p>
                )}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* FOOTER METRIC BAR */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-xxs">
        <span>© 2026 HotFunnel Manager. Todos os direitos de contingência garantidos.</span>
        <div className="flex items-center space-x-4">
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
            ROTA_SEGURA_3000
          </span>
          <span className="hover:text-slate-300 transition cursor-pointer">Sair da central</span>
        </div>
      </footer>

      {/* AI TASK GUIDANCE MODAL */}
      {guidedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backer overlay click to close */}
          <div 
            onClick={() => setGuidedTask(null)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
          />
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-850 bg-slate-950/40 flex items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/25 shrink-0">
                  <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      Passo {guidedTask.stepId}
                    </span>
                    <span className="text-xxs font-semibold text-slate-500">
                      {guidedTask.stepTitle}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-100 mt-1 line-clamp-1">
                    Como executar: {guidedTask.taskText}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setGuidedTask(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 transition p-1.5 rounded-lg cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Active Profile context summary bar */}
              {activeProfile && (
                <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-850 gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img 
                      src={activeProfile.avatarUrl} 
                      alt={activeProfile.name} 
                      className="w-7 h-7 rounded-full object-cover border border-slate-800 shrink-0" 
                    />
                    <div className="min-w-0">
                      <span className="text-xxs font-bold text-slate-400 block uppercase tracking-wider">INTELIGÊNCIA PERSONALIZADA DE PERSONA</span>
                      <span className="text-xs font-bold text-rose-400 truncate block">{activeProfile.name} • {activeProfile.persona.alma}</span>
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono tracking-tight text-right uppercase hidden xs:block">
                    CONEXÃO SEGURA ATIVA
                  </span>
                </div>
              )}

              {/* Response/Loading text */}
              <div className="text-slate-300 text-xs leading-relaxed space-y-3.5 selection:bg-rose-500/30">
                {guidedTaskLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest animate-pulse">Consultando Co-piloto Sênior...</p>
                      <p className="text-[10px] text-slate-500 italic">Estruturando copies, rotinas de ManyChat e ganchos casuais no arquétipo hot da modelo...</p>
                    </div>
                  </div>
                ) : guidedTaskAdvice ? (
                  <div 
                    className="prose prose-invert prose-xs text-slate-300 max-w-none space-y-3"
                    dangerouslySetInnerHTML={{ 
                      __html: guidedTaskAdvice
                        .replace(/\n\n/g, '<div class="h-2"></div>')
                        .replace(/\n/g, '<br />')
                    }} 
                  />
                ) : (
                  <p className="text-slate-400 italic text-center py-10">Lamento, não encontrei nenhuma recomendação estruturada.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-850 bg-slate-950/40 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  if (guidedTaskAdvice) {
                    navigator.clipboard.writeText(guidedTaskAdvice.replace(/<br \/>/g, '\n').replace(/<div class="h-2"><\/div>/g, '\n\n'));
                    alert('Manual tático e copies copiados para a área de transferência!');
                  }
                }}
                disabled={!guidedTaskAdvice || guidedTaskLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-extrabold text-[11px] px-4 py-2 rounded-lg transition border border-slate-750 flex items-center space-x-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Instruções</span>
              </button>
              
              <button
                onClick={() => setGuidedTask(null)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[11px] min-w-[80px] py-2 px-4 rounded-lg shadow-md transition cursor-pointer"
              >
                Concluir Guia
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
