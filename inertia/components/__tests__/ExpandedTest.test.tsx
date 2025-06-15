import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExpandableText } from '../ExpandedText';

 const mockHeights = (scroll: number, client: number) => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => scroll,
  });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => client,
  });
};

describe('<ExpandableText />', () => {
  const longText =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n'.repeat(20);
  const shortText = 'Just a line.';

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a “See more / See less” toggle when the text is clamped', async () => {
    // pretend the element is taller than the visible block
    mockHeights(120, 50);

    render(<ExpandableText text={longText} />);

    // button appears after the requestAnimationFrame → use waitFor
    const seeMoreBtn = await screen.findByRole('button', { name: /see more/i });
    expect(seeMoreBtn).toBeInTheDocument();

    // click → now we should see “See less”
    fireEvent.click(seeMoreBtn);
    expect(
      screen.getByRole('button', { name: /see less/i })
    ).toBeInTheDocument();
  });

  it('does not render the toggle when the text fits', () => {
    // pretend it fits exactly
    mockHeights(50, 50);

    render(<ExpandableText text={shortText} />);

    expect(
      screen.queryByRole('button', { name: /see more/i })
    ).not.toBeInTheDocument();
  });
});
