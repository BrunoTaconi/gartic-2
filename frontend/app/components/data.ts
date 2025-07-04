import { Player, Word } from "../types";

export const wordList: Word[] = [
  { parts: ["GUARDA", "CHUVA"], keyword: "GUARDA-CHUVA" },
  { parts: ["CACHORRO", "QUENTE"], keyword: "CACHORRO-QUENTE" },
  { parts: ["PÃO", "DE QUEIJO"], keyword: "PÃO DE QUEIJO" },
  { parts: ["PÉ", "DE MOLEQUE"], keyword: "PÉ DE MOLEQUE" },
  { parts: ["ARCO", "ÍRIS"], keyword: "ARCO-ÍRIS" },
  { parts: ["COUVE", "FLOR"], keyword: "COUVE-FLOR" },
  { parts: ["GUARDA", "ROUPA"], keyword: "GUARDA-ROUPA" },
  { parts: ["BEIJA", "FLOR"], keyword: "BEIJA-FLOR" },
  { parts: ["SEGUNDA", "FEIRA"], keyword: "SEGUNDA-FEIRA" },
  { parts: ["SALVA", "VIDAS"], keyword: "SALVA-VIDAS" },
];

export const MOCKED_PLAYERS: Record<string, Player> = {
    player1: { id: 'player1', name: 'Desenhista 1', role: 'DRAWER_1' },
    player2: { id: 'player2', name: 'Desenhista 2', role: 'DRAWER_2' },
    player3: { id: 'player3', name: 'Adivinho', role: 'GUESSER' },
};

