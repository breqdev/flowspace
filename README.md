# flowspace
a social network.

### badges

[![Website](https://img.shields.io/website?down_color=important&down_message=offline&up_color=success&up_message=online&url=https%3A%2F%2Fflowspace.breq.dev%2F)](https://flowspace.breq.dev/)
[![Server Tests](https://img.shields.io/github/workflow/status/Breq16/flowspace/Server%20Tests?event=push&label=server%20tests)](https://github.com/Breq16/flowspace/actions/workflows/jest-server.yml)
[![Client Tests](https://img.shields.io/github/workflow/status/Breq16/flowspace/Client%20Tests?event=push&label=client%20tests)](https://github.com/Breq16/flowspace/actions/workflows/jest-client.yml)
![Lines of code](https://img.shields.io/tokei/lines/github/Breq16/flowspace?color=success)
![made with love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-success.svg)


### stack

client:
* react - UI components
* create-react-app - framework
* useSWR - data fetching
* tailwind css - styles
* font awesome - icons
* react-router - routing
* formik - forms
* yup - validation

server:
* node - runtime
* koa - middleware handling (and koa-router, koa-bodyparser, koa-multer)
* prisma - object-relational mapping

hosting:
* cloudflare pages - client
* dokku (on ms azure) - server

data:
* postgres - relational database
* minio - object storage
* redis - rate limiting
