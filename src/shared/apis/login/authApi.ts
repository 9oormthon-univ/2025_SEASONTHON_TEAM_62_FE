import api from '../api';

export type LoginBody = {
  username: string;
  password: string;
  deviceId: string;
};

export type LoginResponse =
  | {
      code?: string;
      success?: string;
      msg?: string;
      data?: {
        accessToken?: string;
        refreshToken?: string;
        [k: string]: any;
      };
      [k: string]: any;
    }
  | any;

export async function login(body: LoginBody): Promise<LoginResponse> {
  const res = await api.post('/api/auth/login', body);
  return res.data;
}
