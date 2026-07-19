// QuizMaster Pro - Authentication Management

const TOKEN_KEY = "qm_access_token";
const REFRESH_KEY = "qm_refresh_token";
const USER_KEY = "qm_user_info";

const auth = {
    saveTokens(accessToken, refreshToken, userDetails) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_KEY, refreshToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userDetails));

        // Set Cookie so backend MVC controllers can read it for routing
        document.cookie = `jwt=${accessToken}; path=/; max-age=900; SameSite=Strict; Secure`;
    },

    clearTokens() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
        localStorage.removeItem(USER_KEY);
        document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict; Secure";
    },

    getAccessToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    getRefreshToken() {
        return localStorage.getItem(REFRESH_KEY);
    },

    getUser() {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return !!this.getAccessToken();
    },

    async fetch(url, options = {}) {
        const headers = { ...(options.headers || {}) };
        const token = this.getAccessToken();

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        if (options.body && !headers["Content-Type"] && !(options.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        options.headers = headers;
        options.credentials = options.credentials || "same-origin";

        let response = await window.fetch(url, options);

        if (response.status === 401 && token) {
            const rotated = await this.refreshToken();
            if (rotated) {
                headers["Authorization"] = `Bearer ${this.getAccessToken()}`;
                options.headers = headers;
                response = await window.fetch(url, options);
            } else {
                this.clearTokens();
                window.location.href = "/auth/login";
                return null;
            }
        }

        return response;
    },

    async refreshToken() {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();

        if (!accessToken || !refreshToken) return false;

        try {
            const response = await window.fetch("/api/auth/refresh-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ accessToken, refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                const user = this.getUser() || {};
                user.role = data.role || user.role;
                user.fullName = data.fullName || user.fullName;
                
                this.saveTokens(data.accessToken, data.refreshToken, user);
                return true;
            }
        } catch (e) {
            console.error("Refresh token error:", e);
        }

        return false;
    },

    async logout() {
        const token = this.getRefreshToken();
        if (token) {
            try {
                await window.fetch("/api/auth/logout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(token)
                });
            } catch (e) {
                console.error("Logout API failed:", e);
            }
        }
        this.clearTokens();
        window.location.href = "/auth/login";
    }
};
