# Security Notes

## Configuration Security

### Credentials Management

The modular refactoring improves security by centralizing configuration, but credentials are still visible in `js/modules/config.js` for ease of setup in this development/demo environment.

### For Production Deployment

**⚠️ IMPORTANT:** Do not commit real credentials to version control in production!

#### Recommended Approach:

1. **Use Environment Variables**
   ```javascript
   // In config.js
   export const SUPABASE_CONFIG = {
       url: process.env.SUPABASE_URL || 'fallback-url',
       anonKey: process.env.SUPABASE_ANON_KEY || 'fallback-key'
   };
   ```

2. **Use a Separate Config File**
   - Copy `js/modules/config.example.js` to `js/modules/config.js`
   - Add `js/modules/config.js` to `.gitignore`
   - Fill in real credentials in the local copy only

3. **Use a Secrets Manager**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - GitHub Secrets (for CI/CD)

### Current State

The Supabase credentials in `config.js` are:
- **Public anonymous keys** (anon key, not secret key)
- Designed to be used in client-side code
- Protected by Row Level Security (RLS) policies in Supabase
- Safe to expose in frontend code

However, best practice is still to:
- Rotate keys periodically
- Use environment-specific credentials
- Apply least-privilege access policies

## API Keys Storage

### JIRA Credentials

JIRA credentials are currently stored in `localStorage`:
- `jira_domain`
- `jira_email`
- `jira_token`

**Security Considerations:**
- localStorage is accessible to any script on the page
- Credentials persist across sessions
- Consider using sessionStorage for temporary access
- Or implement proper OAuth flow for production

### Recommendations:

1. **Short-lived tokens**: Use OAuth tokens with expiration
2. **sessionStorage**: For temporary credential storage
3. **Backend proxy**: Handle JIRA API calls server-side
4. **Encrypt tokens**: Before storing in browser storage

## CORS Proxy Security

The JIRA integration uses a CORS proxy (`http://localhost:8080/proxy`):

**⚠️ Security Risks:**
- Currently proxies any request (no validation)
- Passes credentials in headers
- Runs on localhost (development only)

### For Production:

1. **Implement request validation**
   ```javascript
   // Only allow specific JIRA domains
   const allowedDomains = ['your-company.atlassian.net'];
   ```

2. **Add authentication**
   - Require API key for proxy access
   - Rate limiting
   - Request logging

3. **Use backend integration**
   - Don't expose JIRA credentials to client
   - Handle sync server-side
   - Return only processed data

## Email Scheduler Security

The email scheduler service currently:
- Accepts any POST request
- No authentication required
- Logs all received data

### For Production:

1. **Add API authentication**
   ```javascript
   app.use('/api', (req, res, next) => {
       const apiKey = req.headers['x-api-key'];
       if (apiKey !== process.env.API_KEY) {
           return res.status(401).json({ error: 'Unauthorized' });
       }
       next();
   });
   ```

2. **Validate recipient email**
   - Whitelist allowed domains
   - Verify email format
   - Rate limit requests

3. **Secure SMTP credentials**
   - Use environment variables
   - Never log passwords
   - Use OAuth2 for email sending

## Database Security

### Supabase

The current implementation uses:
- Anonymous (public) key
- Row Level Security should be enabled in Supabase
- Client-side queries

### Recommendations:

1. **Enable RLS policies**
   ```sql
   -- Example RLS policy
   ALTER TABLE initiatives ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own initiatives"
   ON initiatives FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Implement authentication**
   - Add user login system
   - Use Supabase Auth
   - Filter data by user

3. **Validate all inputs**
   - Sanitize user input
   - Use parameterized queries
   - Limit query complexity

## Summary

The refactored code provides a better foundation for security by:
✅ Centralizing configuration
✅ Separating concerns
✅ Providing clear module boundaries
✅ Including validation patterns

However, for production use:
⚠️ Implement proper authentication
⚠️ Use environment variables for secrets
⚠️ Add API key protection
⚠️ Enable comprehensive logging
⚠️ Set up monitoring and alerts

## Security Checklist for Production

- [ ] Move credentials to environment variables
- [ ] Implement user authentication
- [ ] Add API key protection
- [ ] Enable HTTPS/TLS
- [ ] Set up RLS policies in Supabase
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Set up security headers (CSP, HSTS, etc.)
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Implement logging and monitoring
- [ ] Create incident response plan
