export interface GoogleUserData {
  id: string;
  user: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
    hd: string;
    source: string;
  };
  token: string;
}
