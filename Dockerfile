# syntax=docker/dockerfile:1

ARG VITE_APP_TITLE=TextSenseAI
ARG VITE_TXAI_BACKEND_URL
ARG VITE_APP_VERSION=dev

FROM node:20.14.0-alpine AS base

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile

FROM base AS build

ARG VITE_APP_TITLE
ARG VITE_TXAI_BACKEND_URL
ARG VITE_APP_VERSION

COPY . .

ENV VITE_APP_TITLE=${VITE_APP_TITLE}
ENV VITE_TXAI_BACKEND_URL=${VITE_TXAI_BACKEND_URL}
ENV VITE_APP_VERSION=${VITE_APP_VERSION}

# TODO: change command to build as soon as `yarn run type-check` runs without errors
RUN yarn run build-only

FROM nginx

COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 8080
