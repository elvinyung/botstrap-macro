'use strict';

const TokenKinds = {
  OPENBRK: 'OPENBRK',
  CLOSEBRK: 'CLOSEBRK',
  LITERAL: 'LITERAL'
};

exports.TokenKinds = TokenKinds;

class Token {
  constructor(kind, lexeme) {
    this.kind = kind;
    this.lexeme = lexeme;
  }
};

class Tokenizer {
  constructor() {
    this.tokens = [];
    this.currentLexeme = '';
  }

  emit(token) {
    // if we have a nonempty currentLexeme (that was read before the token),
    // emit a literal for that first, and then flush
    if (this.currentLexeme.length > 0 && this.currentLexeme !== token.lexeme) {
      this.tokens.push(new Token(TokenKinds.LITERAL, this.currentLexeme));
    }
    if (token.lexeme.length) {
      this.tokens.push(token);
    }
    this.currentLexeme = '';
  }

  tokenize(src) {
    let chars = src.split('');
    while (chars.length) {
      let char = chars.shift();
      if (char === '\\') {
        let nextChar = chars.shift();
        this.currentLexeme += nextChar;
      }
      else if (char === '$') {
        if (chars[0] === '(') {
          chars.shift();
          this.emit(new Token(TokenKinds.OPENBRK, '$('));
        }
        else {
          this.currentLexeme += char;
        }
      }
      else if (char === ')') {
        this.emit(new Token(TokenKinds.CLOSEBRK, ')'));
      }
      else if (/\s/.test(char)) {
        this.emit(new Token(TokenKinds.LITERAL, this.currentLexeme));
      }
      else {
        this.currentLexeme += char;
      }
    };

    this.emit(new Token(TokenKinds.LITERAL, this.currentLexeme));
  }
};

let tokenizeExpr = exports.tokenizeExpr = function tokenizeExpr(src) {
  let tokenizer = new Tokenizer();
  tokenizer.tokenize(src);
  return tokenizer.tokens;
};

// legacy tokenizer that returns tokens as lexemes instead of objects.
let tokenizeExprToStr = exports.tokenizeExprToStr = function tokenizeExprToStr(src) {
  return tokenizeExpr(src).map(function(token) {
    return token.lexeme;
  });
}
