import { describe, it, expect } from 'vitest';
import { render, screen } from '../test-utils';
import { TopMenu } from '@/components/top-menu';

describe('TopMenu', () => {
  it('should render the search input', () => {
    render(
      <TopMenu
        searchQuery=""
        onSearchChange={() => {}}
        data-testid="top-menu"
      />
    );

    expect(screen.getByTestId('input-search')).toBeInTheDocument();
  });

  it('should update search query on input', async () => {
    const onSearchChange = vi.fn();
    const { user } = render(
      <TopMenu
        searchQuery=""
        onSearchChange={onSearchChange}
        data-testid="top-menu"
      />
    );

    const searchInput = screen.getByTestId('input-search');
    await user.type(searchInput, 'test query');

    expect(onSearchChange).toHaveBeenCalledWith('test query');
  });
});