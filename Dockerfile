# Production image of the THG public website (Angular server-side rendering).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build

# The server bundle is self-contained: no node_modules at runtime.
FROM node:22-alpine
WORKDIR /app
ARG GIT_SHA=unknown
LABEL org.opencontainers.image.source="https://github.com/TeamHighGround/thg-website" \
      org.opencontainers.image.revision="$GIT_SHA"
ENV NODE_ENV=production \
    PORT=4000
COPY --from=build /app/dist/thg-website ./
USER node
EXPOSE 4000
CMD ["node", "server/server.mjs"]
