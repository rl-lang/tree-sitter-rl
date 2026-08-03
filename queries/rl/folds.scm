; blocks (fn bodies, if/while/for bodies, match arm bodies, lambdas)
(block) @fold

; declarations with { ... } bodies
(tag_declaration) @fold
(record_declaration) @fold

; match
(match_expression) @fold

; literals
(array_literal) @fold
(collection_literal) @fold
(struct_literal) @fold

; long parameter lists
(parameter_list) @fold
