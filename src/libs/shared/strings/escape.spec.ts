import { it, describe, expect } from 'vitest'

import { escapeHtml, escapeMention, escapeAll } from './escape'

describe('escape', () => {
  describe('escapeHtml', () => {
    it('should escape HTML', () => {
      expect(escapeHtml('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#39;')
    })

    it('should not escape HTML when no HTML is given', () => {
      expect(escapeHtml('foo')).toBe('foo')
    })
  })

  describe('escapeMention', () => {
    it('should escape mention', () => {
      expect(escapeMention('@foo#bar*baz')).toBe(
        '@\u200cfoo#\u200cbar*\u200cbaz',
      )
    })

    it('should not escape mention when no mention is given', () => {
      expect(escapeMention('foo')).toBe('foo')
    })
  })

  describe('escapeAll', () => {
    it('should escape HTML and mention', () => {
      expect(escapeAll('<>&"\'@foo#bar*baz')).toBe(
        '&lt;&gt;&amp;&quot;&#39;@\u200cfoo#\u200cbar*\u200cbaz',
      )
    })

    it('should not escape all when no HTML or mention is given', () => {
      expect(escapeAll('foo')).toBe('foo')
    })
  })
})
