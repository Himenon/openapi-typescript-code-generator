# TestCase

## Case

### Basic items

- [ ] Type Test
  - [ ] string
    - [ ] enum
  - [ ] number
  - [ ] integer
  - [ ] boolean
  - [ ] array
  - [ ] object
- [ ] Reference Test
  - [ ] Remote Reference
  - [ ] Local Reference
- [ ] Multi Type Test
  - [ ] oneOf
  - [ ] allOf
  - [ ] anyOf

### For generated code

- [ ] Namespace
- [ ] Interface
- [ ] Type Alias
- [ ] Union Type
- [ ] Optional
- [ ] Comment
  - [ ] One line `interface` or `namespace` or `property` comment
  - [ ] Multi line `interface` or `namespace` or `property` comment
- [ ] Topological sort of Reference

### For boundaries supported by this library

- [ ] File extension
  - [ ] json
  - [ ] yaml
  - [ ] yml
- [ ] Directory Structure
  - [ ] Only Support
    - components/schemas
    - components/headers
    - components/responses
    - components/parameters
    - components/requestBodies
    - components/securitySchemes
    - components/pathItems
- [ ] File Name to `Interface` or `TypeAlias` name
- [ ] Directory Name to `Namespace` name

### For error message

## Components Test Example

### schemas

```yml
components:
  schemas:
    Category:
      # UnionType Test
      oneOf:
        # Remote reference Test
        - $ref "components/schemas/Category/Mystery.yml"
        - $ref "components/schemas/Category/Fantasy.yml"
    AuthorId:
      # Type Alias Test
      type: string
    Book:
      type: object
      properties:
        categories:
          type: array
          items:
            # Local Reference Test
            $ref: "#/components/schemas/Category"
    Author:
      type: object
      properties:
        id:
          # Local Reference Test
          $ref: "#/components/schemas/AuthorId"
        books:
          type: array
          items:
            #
            $ref: "#/components/schemas/Book"
```

### reference

- Local Reference
  - Reference が生成されている場合
    - Type Alias を作成
  - Reference が生成されていない場合
    - Reference を作成
    - Type Alias を作成
- Remote Reference
  - Support している Directory Structure の場合
    - Reference が生成されている場合
      - Type Alias を作成
    - Reference が生成されていない場合
      - Reference を作成
      - Type Alias を作成
  - Support していない Directory Structure の場合
    - Interface / TypeDeclaration を生成
