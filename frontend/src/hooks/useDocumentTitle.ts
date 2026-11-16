import { useEffect } from 'react';

export function useDocumentTitle(titulo: string, descricao?: string) {
  useEffect(() => {
    document.title = titulo;

    if (descricao) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = descricao;
    }
  }, [titulo, descricao]);
}
