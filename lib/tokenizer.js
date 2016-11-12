'use strict';

const TokenKinds = {
  OPENBRK: 'OPENBRK',
  CLOSEBRK: 'CLOSEBRK',
  LITERAL: 'LITERAL',
  REGEX: 'REGEX'
};

const TokenizeState = {
  LITERAL: 'LITERAL',
  REGEX: 'REGEX'
};

const REGEXP_FLAGS = /[gimuy]/;

exports.TokenKinds = TokenKinds;

class Token {
  constructor(kind, lexeme) {
    this.kind = kind;
    this.lexeme = lexeme;
    this.state = TokenizeState.SRC;
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
    if (token.lexeme) {
      this.tokens.push(token);
    }
    this.currentLexeme = '';
  }

  tokenize(src) {
    let chars = src.split('');
    while (chars.length) {
      let char = chars.shift();

      switch (this.state)  {
        case TokenizeState.REGEX:
          if (char === '\\') {
            // only escape /.
            if (chars[0] === '/') {
              this.currentLexeme += '/';
              chars.shift();
            }
            else {
              this.currentLexeme += char;
            }

            continue;
          }
          else if (char === '/') {
            let flags = '';

            // hacky: parse flags, but only if it's a contiguous string of
            // flag characters.
            while (chars[0] && REGEXP_FLAGS.test(chars[0])) {
              flags += chars.shift();
            }

            console.log('reg', new RegExp(this.currentLexeme, flags));
            this.emit(new Token(TokenKinds.REGEX,
              new RegExp(this.currentLexeme, flags)));
            this.state = TokenizeState.SRC;
          }
          else {
            this.currentLexeme += char;
          }

          break;
        case TokenizeState.SRC:
          if (char === '\\') {
            let nextChar = chars.shift();
            this.currentLexeme += nextChar;
          }
          // theoretically these should be their own states in a real fsm lexer,
          // but they're small so whatever.
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
          else if (char === '/') {
            this.emit(new Token(TokenKinds.LITERAL, this.currentLexeme));
            this.state = TokenizeState.REGEX;
          }
          else {
            this.currentLexeme += char;
          }
          break;
      }
    }

    this.emit(new Token(this.currentTokenKind, this.currentLexeme));
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
