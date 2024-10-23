# Fastify's swagger crash when using @fastify/swagger 9.2.0 with zod-openapi auto registering schema

## What is the bug

Fastify's swagger does not load when using zod-openapi [auto registering schema](https://www.npmjs.com/package/zod-openapi#creating-components) with @fastify/swagger@9.2.0

## How to reproduce the bug

First start the fastify server

``` bash
npm install
npm serve
```

Then try to open the swagger page: <http://127.0.0.1:5000/documentation>

The error "Failed to load API definition." should appear.

## What causes this bug

Since @fastify/swagger version 9.2.0 that contains this PR <https://github.com/fastify/fastify-swagger/pull/826>, when a response with no description contains a reference, it will try to get the description from the reference.

But this happen AFTER fastify-zod-openapi had add the ref in the response, but BEFORE fastify-zod-openapi created the actual component. So fastify/swagger try here <https://github.com/fastify/fastify-swagger/blob/master/lib/util/resolve-schema-reference.js#L13> to get a defnition on a component that does not exist yet.

This description fallback happens in [this function call](https://github.com/fastify/fastify-swagger/blob/master/lib/spec/openapi/index.js#L52) that is between the 2 transformation steps of fastify-zod-openapi [here](https://github.com/fastify/fastify-swagger/blob/master/lib/spec/openapi/index.js#L31) and [here](https://github.com/fastify/fastify-swagger/blob/master/lib/spec/openapi/index.js#L73)

## Workaround

Downgrade @fastify/swagger from 9.2.0 to 9.1.0

## How to fix it

The fix can be easy by simply change in https://github.com/fastify/fastify-swagger/blob/master/lib/util/resolve-schema-reference.js from

``` javascript
return resolvedReference.definitions[schemaId]
```

to this

``` javascript
return resolvedReference.definitions?.[schemaId]
```
