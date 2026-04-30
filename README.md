# AdvisorNotes

AI-powered meeting notes for financial advisors. Turn rough notes into compliant client emails, CRM entries, suitability memos, and IPS updates.

## Stack

- **Frontend:** Vite + React + Tailwind CSS
- **Backend:** Netlify serverless function (proxies Anthropic API)
- **AI:** Claude (Anthropic API)

## Local development

```bash
npm install
```

Create a `.env` file in the project root:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Then:

```bash
# Install Netlify CLI once (globally)
npm install -g netlify-cli

# Run dev server with functions
netlify dev
```

Open http://localhost:8888

## Deploy to Netlify

### Option A — Drag & drop (fastest)

1. Run `npm install && npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder
4. **Important:** drag-and-drop does NOT include serverless functions. Use Option B for the working app.

### Option B — Git-based (recommended)

1. Push this folder to a new GitHub repo
2. In Netlify: **Add new site → Import an existing project → GitHub**
3. Select the repo. Build settings auto-detect from `netlify.toml`
4. Before deploying, click **Add environment variables**:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your API key from console.anthropic.com
5. Click **Deploy site**

### Option C — Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init      # create a new site, link this folder
netlify env:set ANTHROPIC_API_KEY sk-ant-...
netlify deploy --build --prod
```

## Get an Anthropic API key

1. Sign in at https://console.anthropic.com
2. Go to **API Keys** → **Create Key**
3. Add billing (pay-as-you-go). Each generation costs roughly $0.01–0.03.

## Important compliance note

This is a **prototype**. Before any production use with real client data:

- Conduct a vendor due diligence review
- Confirm your firm's WSP allows AI-assisted communications
- Add audit logging, user authentication, and data retention controls per SEC 17a-4 / FINRA 4511
- Consider a Business Associate Agreement / DPA with Anthropic if handling sensitive PII
- Disable any data-sharing settings on your Anthropic account
