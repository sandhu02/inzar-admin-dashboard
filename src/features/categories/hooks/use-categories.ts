import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  reorderCategories,
  toggleCategoryStatus,
} from '../api/categories';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoryItem,
} from '../types';

export const CATEGORIES_QUERY_KEY = ['categories'] as const;

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCategoryInput) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: ReorderCategoryItem[]) => reorderCategories(items),
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_QUERY_KEY });
      const previous = queryClient.getQueryData<Category[]>(CATEGORIES_QUERY_KEY);

      if (previous) {
        const orderMap = new Map<string, number>();
        newOrder.forEach((item) => orderMap.set(item.id, item.sort_order));

        const optimistic = previous.map((cat) => ({
          ...cat,
          sort_order: orderMap.get(cat.id) ?? cat.sort_order,
        })).sort((a, b) => a.sort_order - b.sort_order);

        queryClient.setQueryData(CATEGORIES_QUERY_KEY, optimistic);
      }

      return { previous };
    },
    onError: (_err, _newOrder, context) => {
      if (context?.previous) {
        queryClient.setQueryData(CATEGORIES_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategoryStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
  });
}
