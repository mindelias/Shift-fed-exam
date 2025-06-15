 import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TicketsList from '../TicketsList';

/* ──────────────────────  simple mocks  ────────────────────── */


jest.mock('../ExpandedText', () => ({
  ExpandableText: ({ text }: { text: string }) => <p>{text}</p>,
}));


jest.mock('../TicketBadge', () => (props: { label: string }) => (
  <span data-testid="badge">{props.label}</span>
));

 jest.mock('~/utils', () => ({
  ...jest.requireActual('~/utils'),
  formatDate: () => '2025-06-15',
}));

/* ──────────────────────  fixture  ────────────────────── */

const tickets = [
  {
    title: 'Cross-Site Scripting (XSS) in comment section',
    content:
      "I discovered that our comment section allows execution of JavaScript code. When users submit comments containing <script> tags, the code executes on other users' browsers. This could lead to session hijacking.",
    userEmail: 'researcher@cybersec.org',
    labels: ['XSS', 'Client-side', 'High Priority'],
    creationTime: 1749540752000,
    id: 'de1f29ca-3dfe-45b4-94df-d694dd6b0f7e',
  },
  {
    title: 'Weak password policy implementation',
    content:
      "The current password policy allows passwords as simple as '123456'. We need to enforce stronger password requirements including minimum length, special characters, and complexity rules.",
    userEmail: 'admin@safebank.com',
    labels: ['Password Security', 'Policy'],
    creationTime: 1749512051000,
    id: '0bd254a0-25d1-43ce-b4f4-8913f8a34ce3',
  },
];

/* ──────────────────────  tests  ────────────────────── */

describe('<TicketsList />', () => {
  it('renders every ticket title and body', () => {
    render(<TicketsList tickets={tickets} toggle={jest.fn()} />);

    expect(
      screen.getByText(/Cross-Site Scripting \(XSS\) in comment section/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Weak password policy implementation/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/allows execution of JavaScript code/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/We need to enforce stronger password requirements/i),
    ).toBeInTheDocument();
  });

  it('calls toggle(id) when “Hide” button is clicked', () => {
    const toggleMock = jest.fn();
    render(<TicketsList tickets={tickets} toggle={toggleMock} />);

    // first ticket's hide button
    const firstHide = screen.getAllByRole('button', { name: /hide/i })[0];
    fireEvent.click(firstHide);

    expect(toggleMock).toHaveBeenCalledTimes(1);
    expect(toggleMock).toHaveBeenCalledWith(tickets[0].id);
  });

  it('renders the correct number of TagBadge elements per ticket', () => {
    render(<TicketsList tickets={tickets} toggle={jest.fn()} />);

    const listItems = screen.getAllByRole('listitem');

    /* Ticket 0 – 3 labels */
    const t0Badges = within(listItems[0]).getAllByTestId('badge');
    expect(t0Badges).toHaveLength(3);
    expect(t0Badges.map((b) => b.textContent)).toEqual(
      expect.arrayContaining(['XSS', 'Client-side', 'High Priority']),
    );

    /* Ticket 1 – 2 labels */
    const t1Badges = within(listItems[1]).getAllByTestId('badge');
    expect(t1Badges).toHaveLength(2);
    expect(t1Badges.map((b) => b.textContent)).toEqual(
      expect.arrayContaining(['Password Security', 'Policy']),
    );
  });
});
