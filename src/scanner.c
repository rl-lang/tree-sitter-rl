#include "tree_sitter/parser.h"
#include <stdio.h>

enum TokenType {
  BLOCK_COMMENT,
  SLASH,
};

void *tree_sitter_rl_external_scanner_create(void) { return NULL; }

void tree_sitter_rl_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_rl_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_rl_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

// A plain "/" (division) is a single-char prefix of "//" (line comment),
// "/*" (block comment), and "/=" (compound divide-assign). Tree-sitter's
// internal lexer greedily claims "/" as division as soon as it's valid at
// the current parser state, without ever offering the fuller "/*"/"//"
// sequence to this scanner. So division has to be decided here too, with
// real 2-character lookahead, rather than left as an ordinary grammar
// token — otherwise every comment right after an expression gets its
// leading "/" stolen by the division operator.
bool tree_sitter_rl_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  fprintf(stderr, "[scan] lookahead=%d BLOCK_COMMENT_valid=%d SLASH_valid=%d\n",
          lexer->lookahead, valid_symbols[BLOCK_COMMENT], valid_symbols[SLASH]);
  fflush(stderr);
  if (lexer->lookahead != '/') return false;

  lexer->advance(lexer, false); // consume the first '/'
  int32_t second = lexer->lookahead;
  fprintf(stderr, "[scan] second=%d\n", second);
  fflush(stderr);

  if (second == '*') {
    if (!valid_symbols[BLOCK_COMMENT]) return false;
    lexer->advance(lexer, false); // consume '*'

    unsigned depth = 1;
    while (depth > 0) {
      if (lexer->eof(lexer)) return false; // unterminated comment

      if (lexer->lookahead == '/') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '*') {
          lexer->advance(lexer, false);
          depth++;
        }
        continue;
      }

      if (lexer->lookahead == '*') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == '/') {
          lexer->advance(lexer, false);
          depth--;
        }
        continue;
      }

      lexer->advance(lexer, false);
    }

    lexer->result_symbol = BLOCK_COMMENT;
    return true;
  }

  // "//" (line comment) and "/=" (divide-assign) are still ordinary
  // internal tokens — decline so the normal lexer can match them.
  if (second == '/' || second == '=') return false;

  if (!valid_symbols[SLASH]) return false;
  lexer->result_symbol = SLASH;
  return true;
}
