# Recast Gated lol-s2 frame

To get set up, you'll need access to the Neynar API and a Farcaster hub.

Make an account with them to get both at [neynar.com](https://neynar.com).

This project runs on cloudflare workers.

I use bun to package and run. I reccommend it.

To install dependencies:

```bash
bun i
```

To manage cloudflare workers:

```bash
bunx wrangler
```

### **_NOTICE_**

Cloudflare workers does this dumb thing where all https requests get sent to port 443, regardless of the port requested. If your hub (or any other https request) needs to be accessed via a port, you'll have to use some reverse proxy :facepalm:.

I used AWS API Gateway, it took <5 min to get a subdomain that just proxied everything from 443 to my hub's port 2281.

## Environment

You need environment variables set for this to work. For local development, set them by making a file `.dev.vars` that looks like this:

```bash
NEYNAR_API_KEY=YOUR API KEY HERE
NEYNAR_HUB_URL=HTTPS ENDPOINT HERE (NO PORTS BESIDES 443)
```

to get these into your production deployment, run

```bash
bunx wrangler secret put NEYNAR_API_KEY
```

and

```bash
bunx wrangler secret put NEYNAR_HUB_URL
```
