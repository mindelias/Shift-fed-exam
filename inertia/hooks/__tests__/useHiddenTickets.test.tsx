import React from 'react';
import { renderHook, act } from '@testing-library/react'
import { useHiddenTickets } from '../useHiddenTicket'

const STORAGE_KEY = 'shift-fed-hidden'

beforeEach(() => {
  localStorage.clear()
  jest.restoreAllMocks()
})

/* ─────────────────────────── tests ─────────────────────────── */

it('starts empty when nothing is in localStorage', () => {
  const { result } = renderHook(() => useHiddenTickets())

  expect(result.current.hiddenIds.size).toBe(0)
})

it('hydrates from localStorage if data exists', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(['abc', 'xyz']))

  const { result } = renderHook(() => useHiddenTickets())

  expect([...result.current.hiddenIds]).toEqual(expect.arrayContaining(['abc', 'xyz']))
})

it('toggle(id) adds then removes the id and persists each time', () => {
  const { result } = renderHook(() => useHiddenTickets())

  // add
  act(() => result.current.toggle('foo'))
  expect(result.current.hiddenIds.has('foo')).toBe(true)
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['foo'])

  // remove
  act(() => result.current.toggle('foo'))
  expect(result.current.hiddenIds.has('foo')).toBe(false)
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([])
})

it('restoreAll() clears the set and localStorage', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(['123']))
  const { result } = renderHook(() => useHiddenTickets())

  act(() => result.current.restoreAll())

  expect(result.current.hiddenIds.size).toBe(0)
  expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual([])
})
