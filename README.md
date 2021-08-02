# flowspace
a social network.

### badges

[![Website](https://img.shields.io/website?down_color=important&down_message=offline&up_color=success&up_message=online&url=https%3A%2F%2Fflowspace.breq.dev%2F)](https://flowspace.breq.dev/)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Breq16/flowspace/Server%20Integration%20Tests?event=push&label=server%20tests)](https://github.com/Breq16/flowspace/actions/workflows/jest-server.yml)
![dependency status](https://img.shields.io/librariesio/release/github/Breq16/flowspace)
![Lines of code](https://img.shields.io/tokei/lines/github/Breq16/flowspace?color=success)
![made with love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-success.svg)


### stack

client:
* react - UI components
* useSWR - data fetching
* tailwind css - styles
* font awesome - icons
* react-router - routing
* formik - forms
* cloudflare pages - hosting

server:
* node - runtime
* koa - middleware handling (and koa-router, koa-bodyparser, koa-multer)
* prisma - object-relational mapping
* postgres - relational database
* minio - object storage
* dokku - hosting
