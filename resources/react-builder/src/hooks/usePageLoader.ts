import { useEffect, useState } from 'react';
import { pagesApi } from '../api/services';
import { useBuilderStore } from '../store/builderStore';

export function usePageLoader(pageId: number | null) {
  const { setPage, setElements } = useBuilderStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageId) {
      setLoading(false);
      return;
    }

    const loadPage = async () => {
      setLoading(true);
      setError(null);

      try {
        const page = await pagesApi.get(pageId);
        setPage(page);

        // Load elements from page.elements or page.content
        const elements = page.elements || page.content?.elements || [];
        setElements(elements);
      } catch (err: any) {
        setError(err.message || 'Failed to load page');
        console.error('Page load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [pageId, setPage, setElements]);

  return { loading, error };
}
