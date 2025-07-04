import { makeAutoObservable, runInAction } from "mobx";
import api from "../service/api";
import type { IUser } from "../models/IUser";
import AuthService from "../service/AuthService";

class AuthStore {
  user: IUser | null = null;
  isAuth = false;

  constructor() {
    makeAutoObservable(this);
    // Load user from localStorage on app start
    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
      this.isAuth = true;
    }
    this.checkAuth();
  }

  setUser(user: IUser) {
    this.user = user;
    this.isAuth = true;
  }

  async checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await api.get("/auth/refresh");
      runInAction(() => {
        const data = res.data as any;
        this.setUser(data.user);
        localStorage.setItem("token", data.accessToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      });
    } catch {
      runInAction(() => {
        this.user = null;
        this.isAuth = false;
        localStorage.removeItem("token");
      });
    }
  }

  async logout() {
    try {
      await AuthService.logout();
    } catch (e) {
      // Optionally handle error
    } finally {
      runInAction(() => {
        this.user = null;
        this.isAuth = false;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
    }
  }
}

export const authStore = new AuthStore();
