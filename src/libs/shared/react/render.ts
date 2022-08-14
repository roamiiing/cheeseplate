import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

export const getMarkupWith = (element: React.ReactElement) => {
  const str = renderToStaticMarkup(element)

  return str
}
