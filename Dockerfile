
FROM denoland/deno:alpine-1.18.2 as builder

WORKDIR /app
COPY deps.ts .
COPY . .

FROM builder as nightly
ENV PORT=8998
EXPOSE 8998
RUN deno cache main.ts
CMD ["run", "-A", "main.ts"]

FROM builder as production
ENV PORT=8997
EXPOSE 8997
RUN deno cache main.ts
CMD ["run", "-A", "main.ts"]