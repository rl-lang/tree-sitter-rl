# tree-sitter-rl

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for the **RL programming language**.

## Install

```bash
npm install tree-sitter-rl
```

## Usage in editors

### Neovim (nvim-treesitter)
Add to your config:
```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.rl = {
  install_info = {
    url = "https://github.com/MohamedGonem/tree-sitter-rl",
    files = { "src/parser.c" },
    branch = "main",
  },
  filetype = "rl",
}
```

### Helix
Add to `languages.toml`:
```toml
[[language]]
name = "rl"
scope = "source.rl"
file-types = ["rl"]
grammar = "rl"

[[grammar]]
name = "rl"
source = { git = "https://github.com/MohamedGonem/tree-sitter-rl", rev = "main" }
```

## Development

```bash
npm install
npx tree-sitter generate
npx tree-sitter test
```
