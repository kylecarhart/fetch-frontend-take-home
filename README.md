# Fetch Frontend Take-Home Exercise

View the [Fetch Frontend Take-Home Live Site](https://fetch-frontend-take-home.pages.dev).

## Main Features

- Tanstack Query
  - Infinite scrolling
- Tanstack Router
- React Suspense
- React Hook Form
- Shadcn UI

## Requirements

See [REQUIREMENTS.md](REQUIREMENTS.md)

## Running the app

```bash
#  Local development
pnpm install
pnpm dev

pnpm build # build for production
pnpm preview # preview prod build
```

## Contributing

Deployments to the `main` branch will be deployed to the production environment in cloudflare.

## TODO

- There is a bug/feature on iOS/Safari where the cookies are not being stored because of `SameSite None` and `Secure`. Resolution seems to be on the api side. See https://stackoverflow.com/questions/58525719/safari-not-sending-cookie-even-after-setting-samesite-none-secure
