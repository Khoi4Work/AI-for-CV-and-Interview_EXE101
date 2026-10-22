# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## GA4 analytics

Analytics is opt in and remains disabled unless all four build variables are valid:

```text
VITE_ANALYTICS_ENABLED=true
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ANALYTICS_ENV=test
VITE_ANALYTICS_ALLOWED_HOSTS=test.example.com
```

Use `production` or `test` for `VITE_ANALYTICS_ENV`. `VITE_ANALYTICS_ALLOWED_HOSTS` is a comma separated exact hostname list. Keep preview and localhost builds out of the production property. In the GA4 web stream, disable automatic history page views and the enhanced measurements that are outside the event contract; the application sends sanitized SPA page views itself.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
