---
title: DiCaf — Dependency Injection Container For JavaScript/TypeScript
slug: dicaf-dependency-injection-container-for-javascript-typescript
date: 2026-06-18
description: Fast and feature-rich dependency injection container for JS/TS
language: EN
tags:
  - tech
  - typescript
  - javascript
  - open-source
  - dependency injection
draft: true
---

Hello everyone! Today I'm sharing my new open source project: **DiCaf**

**DiCaf** is a fast and feature-rich dependency injection container for JavaScript and TypeScript. It works with **ECMAScript Stage 3 decorators**, legacy TypeScript decorators, or manual programmatic configuration.

DiCaf is written in vanilla TypeScript and has **zero** dependencies, unless you use legacy TypeScript decorators, which require _reflect-metadata_.

> - Docs: [dicaf.dev](https://dicaf.dev/)
> - Repository: [github.com/caffeine-projects/dicaf](https://github.com/caffeine-projects/dicaf)

## Main Features

DiCaf was heavily inspired by the Spring Framework from the Java world, and offers similar features, along with many others.

- **Three usage modes** — ECMAScript decorators, legacy decorators, or fully programmatic.
- **Binding targets** — classes, abstract classes, interfaces, functions, and arbitrary values.
- **Profiles** — segregate components by environment or configuration profile.
- **Injection options** — single, array, object, map, and optional injection descriptors.
- **Conditionals** — conditionally register components based on runtime conditions.
- **Scopes** — singleton, transient, request, container, and refreshable scopes.
- **Mixing scopes** — mix different scopes in the same dependency graph without extra configuration.
- **Async factories** — resolve dependencies that require asynchronous initialization.
- **Scan** — automatically scan and register decorated types; no manual module configuration needed.
- **Testing utilities** — first-class support for overrides and isolated containers in tests.
- **Extensible** — custom scopes, injection resolvers, metadata readers, post-processors, and hooks.
- **ESM + CJS** — dual-format package.

## Stage 3 ECMAScript Decorators

Check the example below for Stage 3 ECMAScript decorators:

```typescript
import { DiCaf } from '@caffeine-projects/dicaf'
import { Extends, Injectable } from '@caffeine-projects/dicaf/decorators'

abstract class Logger {
  abstract log(msg: string): void
}

@Injectable()
@Extends()
class ConsoleLogger extends Logger {
  log(msg: string) {
    console.log(msg)
  }
}

@Injectable([Logger]) // injections must be passed here
class UserService {
  constructor(private readonly logger: Logger) {}

  greet(name: string) {
    this.logger.log(`Hello, ${name}!`)
  }
}

const di = new DiCaf()
await di.init() // required before resolutions can happen

const svc = di.get(UserService)
svc.greet('world') // Hello, world!
```

## Programmatic API

If you don't want to use decorators at all, DiCaf offers a programmatic binding API with the feature set from the decorators:

```typescript
import { DiCaf } from '@caffeine-projects/dicaf'

class Logger {
  log(msg: string) {
    console.log(msg)
  }
}

class UserService {
  constructor(private readonly logger: Logger) {}

  greet(name: string) {
    this.logger.log(`Hello, ${name}!`)
  }
}

const di = new DiCaf()

di.bind(Logger).toSelf()
di.bind(UserService).toClass(UserService, [Logger])

await di.init() // required before resolutions can happen

const svc = di.get(UserService)
svc.greet('world') // Hello, world!
```

## Performance

DiCaf was built with performance in mind. Here are some benchmark numbers comparing it with well-known dependency injection libraries, from a run on _June 17, 2026_.

### Singleton

| Library | Latency |
|---|---|
| DiCaf (provider) | 16.37 ns |
| DiCaf | 17.85 ns |
| Awilix | 17.98 ns |
| TypeDI | 27.23 ns |
| Awilix (cradle) | 31.16 ns |
| injection-js | 40.21 ns |
| TSyringe | 68.56 ns |
| NestJS | 81.12 ns |
| Inversify | 101.72 ns |
| LoopBack | 195.07 ns |

### Transient

| Library | Latency |
|---|---|
| Raw (new) | 9.64 ns |
| DiCaf (provider) | 158.11 ns |
| DiCaf | 165.17 ns |
| Awilix | 481.83 ns |
| injection-js | 569.86 ns |
| TSyringe | 1.15 µs |
| Inversify | 1.93 µs |
| TypeDI | 2.28 µs |
| LoopBack | 2.71 µs |
| NestJS | 4.91 µs |


Extracted from [dicaf.dev/benchmarks](https://dicaf.dev/benchmarks).

Note that this is a simple resolution benchmark that might differ from the actual usage model of a particular library. For example, the NestJS container is not usually used directly, but through its application framework.

---

I'd love to hear your feedback, ideas, or questions. Comments are very welcome.

> - [github.com/caffeine-projects/dicaf](https://github.com/caffeine-projects/dicaf)
> - [dicaf.dev](https://dicaf.dev/)
