import XCTest
import SwiftTreeSitter
import TreeSitterRl

final class TreeSitterRlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_rl())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Rl grammar")
    }
}
