---
title: Puma4j — An easy way to load file resources into JUnit 5 tests
slug: puma4j-easier-way-to-load-and-convert-resource-files-in-your-junit-5-tests
date: 2022-02-01
description: Load and parse file resources into JUnit 5 tests with just a couple of annotations.
language: EN
tags:
  - tech
  - java
  - testing
---

Hello developers, in this post I want to present **Puma4j**, a new open source project I recently published that I hope will make your life writing **JUnit 5** tests a little bit easier.

> Check the project repository on [Github](https://github.com/vitorsalgado/puma4j).

## The Project

In testing *microservices*, we usually need to simulate the behavior of external integrations, mocking HTTP requests/responses and messages arriving in topics or queues. For this, we need to build a lot of payloads in our tests.

Instead of creating test data in our code which sometimes leaves our tests a little "dirty," or creating the same boilerplate code all the time to read and parse resource files, why not leverage *JUnit 5* extensions to make a simple and standardized way to do this and also have some fun coding new stuff?

That's why **Puma4j** was created. With **Puma4j**, you can load and convert resources with just a couple of annotations.

Take a look at the usage example below:

### Installation with Gradle

```gradle
implementation "io.github.vitorsalgado.puma4j:puma4j-junit5-extension:4.0.2"
```

### Usage Example

Consider a scenario where you have the following files in your **test resources** directory:

- model.json
- test.txt
- data.yml

```java
@UsePuma4j
class YourJUnit5Test {
  static class Model {
    public String hello;
  }

  @Res("data.yml")
  private static Model ymlData;

  @Res("test.txt")
  private String txt;

  @Test
  void test(@Res("model.json") Model model) {
    assertEquals("world", model.hello);
    assertEquals("world", ymlData.hello);
    assertEquals("hello world", txt);
  }
}
```

Following the example above, to use *Puma4j* we need to annotate our test class with **@UsePuma4j** and then, all fields and method parameters that we want resources to be injected need to be annotated with **@Res(RESOURCE_NAME_AND_EXTENSION)**.

Puma4j will automatically load the resources and convert them based on field or parameter type. For example, you can load the raw file value using a `String` or `byte` array.

### Supported File Types

Puma4j can convert the following resources into Java object instances:

- **JSON**
- **YAML**
- **Properties**

The content of other file types, like **.txt**, can be loaded into a **String** or **byte array**.

### Custom Converters

We can use a custom converter for your resources. Implement the interface `Unmarshaller<O>` and provide the class reference to the annotation **@Use(YourCustomConverter.class)**. The annotation **@Use** can be applied to the class, field, and method parameters.

### Switching JSON Converters

By default, Puma4j uses Jackson Object Mapper to convert JSON resources into Java objects. To switch to Gson, use the annotation **@UseGson**. The annotation can be applied to class, field, and method parameters. In addition, there is **@UseJackson** to force a specific resource to use Object Mapper.

---

> Take a look at the project documentation and source code on [GitHub](https://github.com/vitorsalgado/puma4j).
