export interface Word {
  parts: [string, string];
  keyword: string;
}

export interface Guess {
  user: string | any;
  text: string;
  type: 'guess' | 'correct_part' | 'correct_keyword';
}

export interface Drawer {
  id: string;
  word: string;
}

export interface GameState {
  word: Word | null;
  drawer1: Drawer;
  drawer2: Drawer;
  guesses: Guess[];
  score: number;
  partsGuessed: string[];
}

export type PlayerRole = 'DRAWER_1' | 'DRAWER_2' | 'GUESSER';

export interface Player {
    id: string;
    name: string;
    role: PlayerRole;
}
