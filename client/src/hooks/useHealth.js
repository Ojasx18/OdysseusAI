import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/api';

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: healthService.check,
  });
}
