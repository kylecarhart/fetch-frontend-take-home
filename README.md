# Fetch Frontend Take-Home Exercise

View the [Fetch Frontend Take-Home Live Site](https://fetch-frontend-take-home.pages.dev).

<div align="center">
  <img src="https://github.com/user-attachments/assets/b1adf474-14ff-4e04-88b9-f8611296f39a" width="800" alt="Image" >
</div>

## Main Features

- Tanstack Query w/ infinite scrolling
- Tanstack Router w/ auth gates
- React Suspense
- React Hook Form
- Shadcn UI
- Tailwind
- Zod

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

- Add location search
- Improve UI cohesion
- Improve semantics
- Improve tab navigation/accessibility
- Add tests
- Add CI/CD features like linting, formatting, pre-build, then deploy
- Add git commit hooks like pre-commit and pre-push for linting, formatting, etc...
- There is a bug/feature on iOS/Safari where the cookies are not being stored because of `SameSite None` and `Secure`. Resolution seems to be on the api side. See https://stackoverflow.com/questions/58525719/safari-not-sending-cookie-even-after-setting-samesite-none-secure
