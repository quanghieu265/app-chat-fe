export interface IMessage {
  content: string;
  type: string;
}

export interface IBlog {
  title: string;
  content: string;
  createdAt: string;
}

export interface IAuthor {
  email?: string;
  username?: string;
  post?: IBlog[];
}
