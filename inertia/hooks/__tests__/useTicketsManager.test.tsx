import { renderHook, act } from '@testing-library/react'
import { router } from '@inertiajs/react'
import { Severity } from '~/components/SeverityChips'
import { useTicketsManager } from '../useTickerManager'

// Mock dependencies
jest.mock('@inertiajs/react', () => ({
  router: {
    get: jest.fn(),
  },
}))

// mock useDebounce.ts
jest.mock('./useDebounce', () => ({
  __esModule: true,
  useDebounce: jest.fn((v: unknown) => v),   // <- named export
}));

// mock useIntersection.ts
jest.mock('./useIntersection', () => ({
  __esModule: true,
  useIntersection: jest.fn(() => ({ current: null })), // <- named export
}));

describe('useTicketsManager', () => {
  const mockTickets = {
    data: [
      {
        title: 'CSRF token missing in form submissions',
        content:
          "Several forms on our application don't include CSRF tokens, making them vulnerable to cross-site request forgery attacks. This affects user account settings and payment forms.",
        userEmail: 'developer@webstudio.net',
        labels: ['CSRF', 'Forms', 'Security'],
        creationTime: 1749536775000,
        id: '810375a4-0810-4dbf-8bfd-13d2b04a90a7',
      },
      {
        title: 'Insecure direct object references in API',
        content:
          "The API endpoint /api/users/{id} doesn't validate if the requesting user has permission to access the specified user ID. This allows unauthorized access to other users' data.",
        userEmail: 'pentester@redsec.com',
        labels: ['IDOR', 'API Security', 'Authorization'],
        creationTime: 1749467959000,
        id: 'ebb73ea3-064a-422a-b518-207dd48208b5',
      },
    ],
    meta: {
      total: 2,
      perPage: 10,
      currentPage: 1,
      lastPage: 1,
    },
  }

  const hiddenIds = new Set<string>()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with correct values', () => {
    const { result } = renderHook(() =>
      useTicketsManager({
        initialTickets: mockTickets,
        initialSearch: 'initial',
        initialSeverity: 'Critical',
        hiddenIds,
      })
    )

    expect(result.current.search).toBe('initial')
    expect(result.current.severity).toBe('Critical')
    expect(result.current.ticketData).toEqual(mockTickets.data)
    expect(result.current.loading).toBe(false)
    expect(result.current.hasReachedEnd).toBe(false)
  })

  it('should update search and trigger debounced request', () => {
    const { result } = renderHook(() =>
      useTicketsManager({
        initialTickets: mockTickets,
        initialSearch: '',
        initialSeverity: null,
        hiddenIds,
      })
    )

    act(() => {
      result.current.setSearch('new search')
    })

    expect(result.current.search).toBe('new search')
    expect(router.get).toHaveBeenCalledWith(
      '/',
      { search: 'new search', severity: undefined },
      expect.any(Object)
    )
  })

  it('should update severity and trigger request', () => {
    const { result } = renderHook(() =>
      useTicketsManager({
        initialTickets: mockTickets,
        initialSearch: '',
        initialSeverity: null,
        hiddenIds,
      })
    )

    act(() => {
      result.current.setSeverity('High')
    })

    expect(result.current.severity).toBe('High')
    expect(router.get).toHaveBeenCalledWith(
      '/',
      { search: '', severity: 'High' },
      expect.any(Object)
    )
  })

   it('should filter out hidden tickets', () => {
  // hide the FIRST ticket’s real id
  const hidden = new Set([mockTickets.data[0].id]);

  const { result } = renderHook(() =>
    useTicketsManager({
      initialTickets: mockTickets,
      initialSearch: '',
      initialSeverity: null,
      hiddenIds: hidden,
    }),
  );

  // only the second ticket should remain
  expect(result.current.ticketData).toEqual([mockTickets.data[1]]);
});

  it('should sync rows when initial data changes on first page', () => {
    const newTickets = {
      data: [
        {
          title: 'Session fixation vulnerability detected',
          content:
            "The application doesn't regenerate session IDs after successful login, making it vulnerable to session fixation attacks. An attacker could potentially hijack user sessions.",
          userEmail: 'security.audit@corp.com',
          labels: ['Session Management', 'Authentication'],
          creationTime: 1749474473000,
          id: '2412ac56-82cc-48d5-85f7-89e4248fe721',
        },
      ],
      meta: { ...mockTickets.meta, currentPage: 1 },
    }

    const { result, rerender } = renderHook(
      ({ initialTickets }) =>
        useTicketsManager({
          initialTickets,
          initialSearch: '',
          initialSeverity: null,
          hiddenIds,
        }),
      {
        initialProps: { initialTickets: mockTickets },
      }
    )

    rerender({ initialTickets: newTickets })

    expect(result.current.ticketData).toEqual(newTickets.data)
  })

  it('should not sync rows when not on first page', () => {
    const newTickets = {
      data: [
        {
          title: 'Session fixation vulnerability detected',
          content:
            "The application doesn't regenerate session IDs after successful login, making it vulnerable to session fixation attacks. An attacker could potentially hijack user sessions.",
          userEmail: 'security.audit@corp.com',
          labels: ['Session Management', 'Authentication'],
          creationTime: 1749474473000,
          id: '2412ac56-82cc-48d5-85f7-89e4248fe721',
        },
      ],
      meta: { ...mockTickets.meta, currentPage: 2 },
    }

    const { result, rerender } = renderHook(
      ({ initialTickets }) =>
        useTicketsManager({
          initialTickets,
          initialSearch: '',
          initialSeverity: null,
          hiddenIds,
        }),
      {
        initialProps: { initialTickets: mockTickets },
      }
    )

    rerender({ initialTickets: newTickets })

    expect(result.current.ticketData).toEqual(mockTickets.data)
  })

  it('should return a loaderRef for intersection observer', () => {
    const { result } = renderHook(() =>
      useTicketsManager({
        initialTickets: mockTickets,
        initialSearch: '',
        initialSeverity: null,
        hiddenIds,
      })
    )

    expect(result.current.loaderRef).toEqual({ current: null })
  })
})
