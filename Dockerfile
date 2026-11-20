# Same layout as quranweb's image.

# 1. Dependencies
FROM node:26-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build
FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# HADITH_FAWAZ_URL is NOT needed here: pages are rendered per request (`export const instant = false`), so the build
# needs no network access to the data.
RUN npm run build
# The checkout on the server is made with umask 007, so its directories are closed to "others", and the runtime user
# (nextjs, uid 1001) is "other" for files copied without --chown (quranweb PR #71). public/ is served to everyone anyway.
RUN mkdir -p public && chmod -R a+rX public

# 3. Runtime (Next.js standalone output)
FROM node:26-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Point the data to our mirror, for example:
#   docker run -e HADITH_FAWAZ_URL=/data/hadith-api -v /srv/hadith-api:/data/hadith-api:ro ...
CMD ["node", "server.js"]
