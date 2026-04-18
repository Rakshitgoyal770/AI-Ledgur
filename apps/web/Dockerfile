FROM node:20-bookworm

WORKDIR /workspace

RUN corepack enable

COPY . /workspace

CMD ["bash", "-lc", "pnpm install && pnpm --dir apps/web dev --host 0.0.0.0 --port 5173"]

