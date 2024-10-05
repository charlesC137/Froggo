export interface Post {
  _id: string;
  category: string;
  title: string;
  postDate: string;
  postContent: string;
  postQuote: {
    quote: string;
    quoter: string;
  };
  comments: {
    username: string;
    date: string;
    comment: string;
    userId: string;
  }[];
  likeCount: string[];
  viewCount: Number;
}

export interface Category {
  name: string;
  postCount: Number;
}

export interface TrendingPost {
  id: string;
  category: string;
  title: string;
  date: string;
  rank: Number;
}

export interface UserProfile {
  _id: string;
  email: string;
  username: string;
  bio: string;
  gender: string;
  location: string;
  lastLogin?: string;
}

export interface Chat {
  chatRoomId: string;
  chatType: 'chat' | 'group';
  messages: {
    id: number;
    message: string;
    sender: { name: string; id: string | boolean }; //deal with this boolean later
    deleteState: { forMe: string[]; forEveryone: boolean };
    sendStatus: {
      status: 'sent' | 'received' | 'read';
      sendTime: string;
    };
    reply?: {
      id: string | boolean;
      name: string;
      time: string;
      message: string;
    };
  }[];
  recipient: {
    username: string;
    id: string;
    typing: boolean;
  }[];
  groupDetails: {
    name: string;
    password: string;
    form: string;
    description: string;
    createdAt: string;
    createdBy: string;
    admins: string[];
  };
  filter: { pinned: string[]; archived: string[] };
  deleted: string[];
}

export interface DeleteForm {
  message: Chat['messages'][number] | null;
  form: 'msg' | 'msg for me' | 'clear chat' | 'delete chat';
  e: any;
}
