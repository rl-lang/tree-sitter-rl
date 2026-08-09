((doc_comment) @injection.content
  (#set! injection.language "markdown"))
; (#offset! @injection.content 0 3 0 0))

(call_expression
  function: [
    (identifier) @_fn
    (path_expression) @_fn
  ]
  arguments: (string_literal) @injection.content
  (#any-of? @_fn "compile" "std::c::compile")
; (#offset! @injection.content 0 1 0 -1)
  (#set! injection.language "c"))
