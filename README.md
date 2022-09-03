# flowspace

a social network.

### badges

[![Website](https://img.shields.io/website?down_color=important&down_message=offline&up_color=success&up_message=online&url=https%3A%2F%2Fflowspace.breq.dev%2F)](https://flowspace.breq.dev/)
[![Server Tests](https://img.shields.io/github/workflow/status/breqdev/flowspace/Server%20Tests?event=push&label=server%20tests)](https://github.com/breqdev/flowspace/actions/workflows/jest-server.yml)
[![Client Tests](https://img.shields.io/github/workflow/status/breqdev/flowspace/Client%20Tests?event=push&label=client%20tests)](https://github.com/breqdev/flowspace/actions/workflows/jest-client.yml)
![Lines of code](https://img.shields.io/tokei/lines/github/breqdev/flowspace?color=success)
![made with love](https://img.shields.io/badge/made%20with-%E2%9D%A4%EF%B8%8F-success.svg)

### stack

client:

- react - UI components
- create-react-app - framework
- useSWR - data fetching
- tailwind css - styles
- font awesome - icons
- react-router - routing
- formik - forms
- yup - validation

server:

- node - runtime
- koa - middleware handling (and koa-router, koa-bodyparser, koa-multer)
- prisma - object-relational mapping

hosting:

- vercel - client
- dokku (on ms azure) - server

data:

- postgres - relational database
- google cloud s3 - object storage
- redis - rate limiting
