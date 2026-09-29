import '@testing-library/jest-dom'
import '@testing-library/dom'
import '@testing-library/react'
import ResizeObserver from 'resize-observer-polyfill'

global.ResizeObserver = global.ResizeObserver || ResizeObserver
