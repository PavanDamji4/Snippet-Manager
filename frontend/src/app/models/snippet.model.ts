export interface Snippet {
  id?: number;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string;
  createdAt?: Date;
  updatedAt?: Date;
  username?: string;
}

export interface SnippetStatistics {
  totalSnippets: number;
  languageStatistics: { [key: string]: number };
}