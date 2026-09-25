; ─── Keywords ───────────────────────────────────────────────────────────────

[
  "if"
  "else"
  "loop"
  "while"
  "for"
  "in"
  "return"
  "match"
  "impl"
  "requires"
  "ensures"
  "is"
] @keyword.control

(break_statement) @keyword.control
(continue_statement) @keyword.control

[
  "dec"
  "CONST"
  "fn"
  "tag"
  "record"
  "type"
] @keyword.declaration

[
  "int"
  "uint"
  "float"
  "bool"
  "string"
  "byte"
  "sbyte"
  "char"
  "arr"
  "set"
  "map"
  "error"
  "result"
  "any"
  "handle"
] @type.builtin

[
  "big"
  "small"
] @type.qualifier

[
  "get"
  "from"
] @keyword.import

[
  "and"
  "or"
  "|>"
  "as"
] @keyword.operator

(shebang) @comment

; ─── Literals ───────────────────────────────────────────────────────────────

(integer_literal) @number
(float_literal)   @number.float
(string_literal)  @string
(char_literal)    @string.special.symbol
(bool_literal)    @boolean
(null_literal)    @constant.builtin

; ─── Functions ──────────────────────────────────────────────────────────────

; Function declaration
(function_declaration
  name: (identifier) @function)

; Direct function call
(call_expression
  function: (identifier) @function.call)

; Module path function call (e.g. module::fn_name())
(call_expression
  function: (path_expression
    segment: (identifier) @function.call .))

; Method call
(method_call_expression
  method: (identifier) @function.method)

; Lambda
(lambda_expression) @function

; ─── Types & Declarations ───────────────────────────────────────────────────

(tag_declaration
  name: (identifier) @type)

(record_declaration
  name: (identifier) @type)

(impl_block
  type: (identifier) @type)

(tag_variant
  name: (identifier) @type.enum.variant)

(record_field
  name: (identifier) @property)

; Type annotations in declarations/parameters
(record_field type: (identifier) @type)
(parameter type: (identifier) @type)
(binding type: (identifier) @type)

; ─── Struct Literals & Fields ───────────────────────────────────────────────

(struct_literal
  type: (identifier) @type)

(struct_field_init
  name: (identifier) @property)

(field_access_expression
  object: (identifier) @type
  field: (identifier) @type.enum.variant
  (#match? @type "^[A-Z]"))

(field_access_expression
  field: (identifier) @property)

(variant_pattern
  tag: (identifier) @type
  variant: (identifier) @type.enum.variant)

; ─── Match & Patterns ───────────────────────────────────────────────────────

(wildcard_pattern) @constant.builtin

; ─── Identifiers & Variables ────────────────────────────────────────────────

(identifier) @variable

(variable_declaration
  (binding_list
    (binding
      name: (identifier) @variable)))

(constant_declaration
  (binding_list
    (binding
      name: (identifier) @constant)))

(parameter
  name: (identifier) @variable.parameter)

; ─── Operators ──────────────────────────────────────────────────────────────

[
  "=="
  "!="
  "<"
  "<="
  ">"
  ">="
] @operator.comparison

[
  "="
  "+="
  "-="
  "*="
  "/="
] @operator.assignment

[
  "+"
  "-"
  "*"
  "/"
] @operator.arithmetic

"=>" @operator.arrow
"->" @operator.arrow
".." @operator.range
"::" @operator.path
"!"  @operator.bang
"?"  @operator
"as" @operator.cast

; ─── Attributes ─────────────────────────────────────────────────────────────

"!#" @attribute
(attribute
  name: (identifier) @attribute)

; ─── Punctuation ────────────────────────────────────────────────────────────

"."  @punctuation.delimiter
","  @punctuation.separator
":"  @punctuation.separator

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

; ─── Comments ───────────────────────────────────────────────────────────────

(line_comment)  @comment
(block_comment) @comment
(doc_comment)   @comment.documentation

; ─── Namespaces & Paths ─────────────────────────────────────────────────────

(import_statement
  module: (path_expression) @namespace)

(path_expression
  segment: (identifier) @namespace)

; ─── Builtin result constructors ────────────────────────────────────────────
; Placed last so this capture wins over the generic `(identifier) @variable`.

(call_expression
  function: (identifier) @function.builtin
  (#any-of? @function.builtin "ok" "err"))
