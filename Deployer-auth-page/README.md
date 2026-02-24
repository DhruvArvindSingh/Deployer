## DeployNet Auth Page (Static HTML)

This folder contains the **static HTML auth UI** used by the DeployNet CLI:

- `index.html` – main login page (GitHub / Google buttons)
- `callback.html` – finishes OAuth, talks to the backend, and shows the token

Both files ship with placeholder values that **you must replace** before hosting.

---

## 1. Backend URL

### Where to set it

- In `index.html`:

```html
<script>
  const BACKEND_URL = 'put-your-backend-url';
  const CLI_CALLBACK_URL = 'put-your-callback-url';
  …
</script>
```

- In `callback.html`:

```html
<script>
  const BACKEND_URL = 'put-your-backend-url';
  …
</script>
```

### What to put here

- **`BACKEND_URL`**: The public base URL of your DeployNet backend, for example:
  - `https://api.example.com`
  - `http://localhost:8080` (for local testing)

Make sure this URL matches what your backend is actually listening on.

---

## 2. CLI Callback URL

The CLI runs a small local HTTP/HTTPS server to receive the auth token.

### Where to set it

- In `index.html`:

```js
const CLI_CALLBACK_URL = 'put-your-callback-url';
```

### What to put here

Use the URL that your CLI listens on, for example:

- For the simple HTTP callback:
  - `http://localhost:5000/auth/callback`
- If you enabled HTTPS in the CLI:
  - `https://localhost:5443/auth/callback`

This URL is **never** called from a remote server; it is only called by the browser on the user’s machine to talk to the local CLI.

---

## 3. OAuth Client IDs (GitHub / Google)

The static page directly sends users to GitHub/Google OAuth using your client IDs.

### Where to set them

In `index.html`, near the bottom:

```js
function handleOAuth(provider) {
  …
  const clientId = provider === 'github' 
    ? 'put-your-github-client-id' 
    : 'put-your-google-client-id';
  …
}
```

### What to put here

- Replace `'put-your-github-client-id'` with your **GitHub OAuth Client ID**
- Replace `'put-your-google-client-id'` with your **Google OAuth Client ID**

You get these values from the GitHub / Google developer consoles when you create an OAuth app.

Your **redirect URL** for both providers should point to the hosted `callback.html`, for example:

- `https://deployer-cli.example.com/callback.html`

Make sure this matches exactly in the provider configuration and in the `redirectUri` you build in `index.html`:

```js
const redirectUri = `${window.location.origin}/callback.html`;
```

---

## 4. Typical Production Setup

1. Host `index.html` and `callback.html` at a public URL, e.g. `https://deployer-cli.example.com`
2. Set:
   - `BACKEND_URL` → your backend API URL, e.g. `https://api.example.com`
   - `CLI_CALLBACK_URL` → your CLI callback URL, e.g. `https://localhost:5443/auth/callback`
   - GitHub / Google client IDs in `handleOAuth`
3. Configure OAuth apps:
   - **Redirect URL**: `https://deployer-cli.example.com/callback.html`
4. Rebuild/redeploy the static site after editing the HTML.

---

## 5. Local Testing Setup

For local testing with a locally running backend and CLI:

- `BACKEND_URL = 'http://localhost:8080'`
- `CLI_CALLBACK_URL = 'http://localhost:5000/auth/callback'` (or your HTTPS port)
- Host `index.html` and `callback.html` via a simple static server, for example:

```bash
cd Deployer-auth-page
python3 -m http.server 3000
```

Then open `http://localhost:3000/index.html` in your browser and run `deployer login` in your terminal.

