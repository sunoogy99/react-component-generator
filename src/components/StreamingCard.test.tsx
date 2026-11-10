import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreamingCard } from './StreamingCard';

describe('StreamingCard', () => {
  it('코드 탭이 선택된 상태로 실시간 코드를 보여준다', () => {
    render(<StreamingCard prompt="버튼" code="const Button = () => null;" />);

    expect(screen.getByRole('tab', { name: '코드' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('const Button = () => null;')).toBeInTheDocument();
  });

  it('생성이 끝나기 전에는 미리보기 탭을 비활성화한다', () => {
    render(<StreamingCard prompt="버튼" code="" />);

    expect(screen.getByRole('tab', { name: '미리보기' })).toBeDisabled();
  });

  it('아직 받은 코드가 없으면 대기 문구를 보여준다', () => {
    render(<StreamingCard prompt="버튼" code="" />);

    expect(screen.getByRole('status')).toHaveTextContent('응답을 기다리는 중');
  });
});
