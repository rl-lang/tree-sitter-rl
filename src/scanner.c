#include "tree_sitter/parser.h"

enum TokenType {
  BLOCK_COMMENT,
};

void *tree_sitter_rl_external_scanner_create(void) { return NULL; }

void tree_sitter_rl_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_rl_external_scanner_serialize(void *payload, char *buffer) {
  return 0;
}

void tree_sitter_rl_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {}

// Scans a (possibly nested) block comment: /* ... /* ... */ ... */
static bool scan_block_comment(TSLexer *lexer) {
  if (lexer->lookahead != '/') return false;
  lexer->advance(lexer, false);
  if (lexer->lookahead != '*') return false;
  lexer->advance(lexer, false);

  unsigned depth = 1;

  while (depth > 0) {
    if (lexer->eof(lexer)) {
      // Unterminated comment: stop here rather than consuming the rest of the file.
      return false;
    }

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

bool tree_sitter_rl_external_scanner_scan(void *payload, TSLexer *lexer, const bool *valid_symbols) {
  if (!valid_symbols[BLOCK_COMMENT]) return false;
  return scan_block_comment(lexer);
}
