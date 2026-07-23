/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "rl",

  extras: ($) => [/\s/, $.line_comment, $.block_comment, $.doc_comment],

  word: ($) => $.identifier,

  externals: ($) => [$.block_comment, $._slash],

  conflicts: ($) => [[$.return_statement], [$._expression, $.struct_literal]],

  rules: {
    // ─── Top level ────────────────────────────────────────────────────────────
    source_file: ($) => repeat($._statement),

    // ─── Statements ───────────────────────────────────────────────────────────
    _statement: ($) =>
      choice(
        $.function_declaration,
        $.variable_declaration,
        $.constant_declaration,
        $.array_declaration,
        $.import_statement,
        $.while_statement,
        $.for_statement,
        $.loop_statement,
        $.if_statement,
        $.impl_block,
        $.return_statement,
        $.break_statement,
        $.continue_statement,
        $.tag_declaration,
        $.record_declaration,
        $.expression_statement,
      ),

    loop_statement: ($) => seq("loop", field("body", $.block)),

    impl_block: ($) =>
      seq(
        "impl",
        field("type", $.identifier),
        "{",
        repeat($.function_declaration),
        "}",
      ),

    // fn name(type param, ...) -> type { body }
    function_declaration: ($) =>
      seq(
        optional(repeat($.attribute)),
        "fn",
        field("name", $.identifier),
        "(",
        field("params", optional($.parameter_list)),
        ")",
        optional(seq("->", field("return_type", $._type))),
        field("body", $.block),
      ),

    parameter_list: ($) => seq($.parameter, repeat(seq(",", $.parameter))),

    parameter: ($) => seq(field("type", $._type), field("name", $.identifier)),

    // dec type name = value   (explicit type)
    // dec name = value        (inferred type)
    variable_declaration: ($) =>
      seq(
        "dec",
        optional(field("type", $._type)),
        field("name", $.identifier),
        "=",
        field("value", $._expression),
      ),

    // const type name = value
    constant_declaration: ($) =>
      seq(
        "CONST",
        field("type", $._type),
        field("name", $.identifier),
        "=",
        field("value", $._expression),
      ),

    // arr type name = [...]  /  const arr type name = [...]
    array_declaration: ($) =>
      seq(
        optional("const"),
        "arr",
        field("type", $._type),
        field("name", $.identifier),
        "=",
        field("value", $.array_literal),
      ),

    // get fn1, fn2 from mod::sub
    // get from mod::sub
    import_statement: ($) =>
      seq(
        "get",
        optional(seq(commaSep1(field("names", $.identifier)), "from")),
        optional("from"),
        field("module", $.path_expression),
      ),

    while_statement: ($) =>
      seq("while", field("condition", $._expression), field("body", $.block)),

    for_statement: ($) =>
      choice(
        // for x in iterable { }
        seq(
          "for",
          field("variable", $.identifier),
          "in",
          field("iterable", $._expression),
          field("body", $.block),
        ),
        // for x in start..end { }
        seq(
          "for",
          field("variable", $.identifier),
          "in",
          field("range", $.range_expression),
          field("body", $.block),
        ),
      ),

    if_statement: ($) =>
      seq(
        "if",
        field("condition", $._expression),
        field("consequence", $.block),
        repeat(
          seq(
            "else",
            "if",
            field("condition", $._expression),
            field("consequence", $.block),
          ),
        ),
        optional(seq("else", field("alternative", $.block))),
      ),

    return_statement: ($) => seq("return", optional($._expression)),

    break_statement: (_) => token("break"),

    continue_statement: (_) => token("continue"),

    expression_statement: ($) => $._expression,

    assign_expression: ($) =>
      prec.right(
        1,
        seq(
          field(
            "name",
            choice($.identifier, $.index_expression, $.field_access_expression),
          ),
          choice("=", "+=", "-=", "*=", "/="),
          field("value", $._expression),
        ),
      ),

    block: ($) => seq("{", repeat($._statement), "}"),

    // tag Name { Variant1, Variant2, Variant3(type, type), ... }
    tag_declaration: ($) =>
      seq(
        "tag",
        field("name", $.identifier),
        "{",
        commaSep1($.tag_variant),
        optional(","),
        "}",
      ),

    tag_variant: ($) =>
      seq(
        field("name", $.identifier),
        optional(seq("(", commaSep1($._type), ")")),
      ),

    // record Name { type field, type field, ... }
    record_declaration: ($) =>
      seq(
        "record",
        field("name", $.identifier),
        "{",
        commaSep1($.record_field),
        optional(","),
        "}",
      ),

    record_field: ($) =>
      seq(field("type", $._type), field("name", $.identifier)),

    // ─── Match ────────────────────────────────────────────────────────────────
    // match expr { pattern => { ... }, _ => { ... } }
    match_expression: ($) =>
      seq(
        "match",
        field("value", $._expression_no_struct_literal),
        "{",
        repeat($.match_arm),
        "}",
      ),

    _expression_no_struct_literal: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.call_expression,
        $.method_call_expression,
        $.field_access_expression,
        $.index_expression,
        $.path_expression,
        $.grouping_expression,
        prec(1, $.identifier),
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.char_literal,
        $.bool_literal,
        $.null_literal,
      ),

    match_arm: ($) =>
      seq(
        field("pattern", $._pattern),
        "=>",
        field("body", $.block),
        optional(","),
      ),

    _pattern: ($) =>
      choice(
        $.wildcard_pattern,
        $.variant_pattern,
        $.path_expression,
        $.literal_pattern,
        $.identifier,
      ),

    wildcard_pattern: (_) => "_",

    variant_pattern: ($) =>
      seq(field("tag", $.identifier), ".", field("variant", $.identifier)),

    literal_pattern: ($) =>
      choice(
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.char_literal,
        $.bool_literal,
        $.null_literal,
      ),

    // ─── Expressions ─────────────────────────────────────────────────────────
    _expression: ($) =>
      choice(
        $.binary_expression,
        $.unary_expression,
        $.propagate_expression,
        $.assign_expression,
        $.call_expression,
        $.method_call_expression,
        $.field_access_expression,
        $.index_expression,
        $.path_expression,
        $.lambda_expression,
        $.array_literal,
        $.collection_literal,
        $.struct_literal,
        $.match_expression,
        $.grouping_expression,
        $.identifier,
        $.integer_literal,
        $.float_literal,
        $.string_literal,
        $.char_literal,
        $.bool_literal,
        $.null_literal,
      ),

    binary_expression: ($) =>
      choice(
        prec.left(1, seq($._expression, choice("==", "!="), $._expression)),
        prec.left(
          2,
          seq($._expression, choice("<", "<=", ">", ">="), $._expression),
        ),
        prec.left(3, seq($._expression, choice("+", "-"), $._expression)),
        prec.left(
          4,
          seq($._expression, choice("*", alias($._slash, "/")), $._expression),
        ),
        prec.left(0, seq($._expression, choice("and", "or"), $._expression)),
      ),

    unary_expression: ($) =>
      prec.right(5, seq(choice("!", "-"), $._expression)),

    propagate_expression: ($) =>
      prec.left(6, seq(field("value", $._expression), "?")),

    call_expression: ($) =>
      prec(
        1,
        seq(
          field("function", choice($.identifier, $.path_expression)),
          "(",
          field("arguments", optional(commaSep1($._expression))),
          ")",
        ),
      ),

    method_call_expression: ($) =>
      prec(
        2,
        seq(
          field("object", $._expression),
          ".",
          field("method", $.identifier),
          "(",
          field("arguments", optional(commaSep1($._expression))),
          ")",
        ),
      ),

    field_access_expression: ($) =>
      prec(
        1,
        seq(field("object", $._expression), ".", field("field", $.identifier)),
      ),

    index_expression: ($) =>
      prec(
        2,
        seq(
          field("target", $._expression),
          "[",
          field("index", $._expression),
          "]",
        ),
      ),

    path_expression: ($) =>
      seq(
        field("segment", $.identifier),
        repeat1(seq("::", field("segment", $.identifier))),
      ),

    lambda_expression: ($) =>
      seq(
        "fn",
        "(",
        optional($.parameter_list),
        ")",
        optional(seq("->", $._type)),
        $.block,
      ),

    grouping_expression: ($) => seq("(", $._expression, ")"),

    range_expression: ($) =>
      seq(field("start", $._expression), "..", field("end", $._expression)),

    array_literal: ($) => seq("[", optional(commaSep1($._expression)), "]"),

    collection_literal: ($) =>
      seq("{", optional(commaSep1($._collection_item)), optional(","), "}"),

    _collection_item: ($) => choice($.map_entry, $._expression),

    map_entry: ($) =>
      seq(field("key", $._expression), ":", field("value", $._expression)),

    struct_literal: ($) =>
      seq(
        field("type", $.identifier),
        "{",
        optional(commaSep1($.struct_field_init)),
        optional(","),
        "}",
      ),

    struct_field_init: ($) =>
      seq(field("name", $.identifier), ":", field("value", $._expression)),

    // ─── Types ────────────────────────────────────────────────────────────────
    _type: ($) =>
      choice(
        $._builtin_type,
        $.array_type,
        $.set_type,
        $.map_type,
        $.identifier,
        "fn",
      ),

    _builtin_type: (_) => choice("int", "float", "bool", "string", "char"),

    array_type: ($) => seq("arr", "[", field("element", $._type), "]"),

    set_type: ($) => seq("set", "[", field("element", $._type), "]"),

    map_type: ($) =>
      seq("map", "[", field("key", $._type), ",", field("value", $._type), "]"),

    // ─── Literals ─────────────────────────────────────────────────────────────
    integer_literal: (_) => /[0-9]+/,

    float_literal: (_) => /[0-9]+\.[0-9]+/,

    string_literal: (_) => seq('"', repeat(choice(/[^"\\]+/, /\\./)), '"'),

    char_literal: (_) => seq("'", choice(/[^'\\]/, /\\./), "'"),

    bool_literal: (_) => choice("true", "false"),

    null_literal: (_) => "null",

    // ─── Identifiers ──────────────────────────────────────────────────────────
    identifier: (_) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // ─── Comments ─────────────────────────────────────────────────────────────
    line_comment: (_) => token(/\/\/.*/),
    doc_comment: (_) => token(prec(1, /\/\/\/+.*/)),

    attribute: ($) =>
      seq(
        "!#",
        "[",
        field("name", $.identifier),
        optional(
          seq("(", field("value", optional(commaSep1($._expression))), ")"),
        ),
        "]",
      ),
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
/**
 * @param {RuleOrLiteral} rule
 * @returns {SeqRule}
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
