;  keywords

[
  "if"
  "else"
  "while"
  "for"
  "in"
  "return"
  "match"
] @keyword.control

(break_statement) @keyword.control
(continue_statement) @keyword.control

[
  "dec"
  "CONST"
  "fn"
  "tag"
  "record"
] @keyword.declaration

[
  "int"
  "float"
  "bool"
  "string"
  "char"
  "arr"
  "set"
  "map"
] @type.builtin

[
  "get"
  "from"
] @keyword.import

[
  "and"
  "or"
] @keyword.operator

;  literals

(integer_literal) @number
(float_literal)   @number.float
(string_literal)  @string
(char_literal)    @string.special.symbol
(bool_literal)    @boolean
(null_literal)    @constant.builtin

;  functions

; function declaration name
(function_declaration
  name: (identifier) @function)

; function call
(call_expression
  function: (identifier) @function.call)

; method call
(method_call_expression
  method: (identifier) @function.method)

; lambda
(lambda_expression) @function

;  types (tag / record declarations)

(tag_declaration
  name: (identifier) @type)

(record_declaration
  name: (identifier) @type)

(tag_variant
  name: (identifier) @type.enum.variant)

(record_field
  name: (identifier) @property)

; user-defined type reference, e.g. `dec my_struct x = ...`
(record_field type: (identifier) @type)
(parameter type: (identifier) @type)
(variable_declaration type: (identifier) @type)
(constant_declaration type: (identifier) @type)
(array_declaration type: (identifier) @type)

;  struct literals / field & variant access

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

;  match

(wildcard_pattern) @constant.builtin
"=>" @operator.arrow

;  variables

(variable_declaration
  name: (identifier) @variable)

(constant_declaration
  name: (identifier) @constant)

(parameter
  name: (identifier) @variable.parameter)

(identifier) @variable

;  operators

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

"->" @operator.arrow
".." @operator.range
"::" @operator.path
"!"  @operator.bang
"!#" @operator.bang

;  punctuation

"."  @punctuation.delimiter
","  @punctuation.separator

"(" @punctuation.bracket
")" @punctuation.bracket
"[" @punctuation.bracket
"]" @punctuation.bracket
"{" @punctuation.bracket
"}" @punctuation.bracket

;  comments

(line_comment)  @comment

;  module paths

(import_statement
  module: (path_expression) @namespace)

(path_expression
  segment: (identifier) @namespace)
