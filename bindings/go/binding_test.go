package tree_sitter_rl_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_rl "github.com/mohamedgonem/tree-sitter-rl/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_rl.Language())
	if language == nil {
		t.Errorf("Error loading Rl grammar")
	}
}
